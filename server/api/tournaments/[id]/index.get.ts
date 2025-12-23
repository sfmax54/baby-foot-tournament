export default defineEventHandler(async (event) => {
  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      },
      teams: {
        orderBy: {
          createdAt: 'asc'
        }
      },
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true
        },
        orderBy: {
          matchNumber: 'asc'
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

  return {
    success: true,
    tournament
  }
})
