export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event)

  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: true,
      teams: {
        include: {
          members: true
        }
      }
    }
  })

  if (!tournament) {
    throw createError({
      statusCode: 404,
      message: 'Tournament not found'
    })
  }

  // Check if matches have already been generated
  if (tournament.matches.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'Cannot register team: matches have already been generated.'
    })
  }

  // Check if user already has a team in this tournament
  const existingTeam = tournament.teams.find(team =>
    team.members.some(member => member.userId === user.userId)
  )

  if (existingTeam) {
    throw createError({
      statusCode: 400,
      message: 'You already have a team in this tournament'
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = registerTeamSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  const { name, partnerEmail } = result.data

  // Check if partner exists
  const partner = await prisma.user.findUnique({
    where: { email: partnerEmail }
  })

  if (!partner) {
    throw createError({
      statusCode: 400,
      message: `No user found with email ${partnerEmail}. Please ask them to create an account first.`
    })
  }

  // Check if partner is the same as current user
  if (partner.id === user.userId) {
    throw createError({
      statusCode: 400,
      message: 'You cannot team up with yourself'
    })
  }

  // Check if partner already has a team in this tournament
  const partnerExistingTeam = tournament.teams.find(team =>
    team.members.some(member => member.userId === partner.id)
  )

  if (partnerExistingTeam) {
    throw createError({
      statusCode: 400,
      message: `${partner.username} already has a team in this tournament`
    })
  }

  // Create team with both members
  const team = await prisma.team.create({
    data: {
      name,
      tournamentId,
      members: {
        create: [
          { userId: user.userId },
          { userId: partner.id }
        ]
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      },
      tournament: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return {
    success: true,
    team
  }
})
