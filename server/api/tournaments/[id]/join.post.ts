export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event)
  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  const body = await readBody(event)
  const { teamName, partnerEmail } = body

  if (!teamName || !partnerEmail) {
    throw createError({
      statusCode: 400,
      message: 'Team name and partner email are required'
    })
  }

  // Verify tournament exists and is open for registration
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: true
    }
  })

  if (!tournament) {
    throw createError({
      statusCode: 404,
      message: 'Tournament not found'
    })
  }

  if (tournament.status !== 'UPCOMING') {
    throw createError({
      statusCode: 400,
      message: 'Tournament is not open for registration'
    })
  }

  // Check if matches have already been generated
  if (tournament.matches.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'Cannot join tournament: matches have already been generated. Please contact the tournament admin.'
    })
  }

  // Find partner user
  const partner = await prisma.user.findUnique({
    where: { email: partnerEmail }
  })

  if (!partner) {
    throw createError({
      statusCode: 404,
      message: 'Partner not found. They need to create an account first.'
    })
  }

  if (partner.id === user.userId) {
    throw createError({
      statusCode: 400,
      message: 'You cannot team up with yourself'
    })
  }

  // Check if user is already in a team for this tournament
  const existingTeamMembership = await prisma.teamMember.findFirst({
    where: {
      userId: user.userId,
      team: {
        tournamentId
      }
    }
  })

  if (existingTeamMembership) {
    throw createError({
      statusCode: 409,
      message: 'You are already registered in a team for this tournament'
    })
  }

  // Check if partner is already in a team for this tournament
  const partnerTeamMembership = await prisma.teamMember.findFirst({
    where: {
      userId: partner.id,
      team: {
        tournamentId
      }
    }
  })

  if (partnerTeamMembership) {
    throw createError({
      statusCode: 409,
      message: 'Your partner is already registered in another team for this tournament'
    })
  }

  // Create team with both members
  const team = await prisma.team.create({
    data: {
      name: teamName,
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
      }
    }
  })

  return {
    success: true,
    team,
    message: 'Successfully joined tournament'
  }
})
