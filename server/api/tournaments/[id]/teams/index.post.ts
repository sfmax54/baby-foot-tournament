export default defineEventHandler(async (event) => {
  requireAdmin(event)

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
      matches: true
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
      message: 'Cannot add team: matches have already been generated. Delete existing matches first to add new teams.'
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = createTeamSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  const { name, player1Name, player2Name } = result.data

  // Create team
  const team = await prisma.team.create({
    data: {
      name,
      player1Name,
      player2Name,
      tournamentId
    },
    include: {
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
