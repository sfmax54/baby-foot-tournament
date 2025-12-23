export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const matchId = getRouterParam(event, 'id')

  if (!matchId) {
    throw createError({
      statusCode: 400,
      message: 'Match ID required'
    })
  }

  const body = await readBody(event)
  const result = updateMatchSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId }
  })

  if (!match) {
    throw createError({
      statusCode: 404,
      message: 'Match not found'
    })
  }

  // Validate that if status is COMPLETED, one team must have reached 10 goals
  if (result.data.status === 'COMPLETED') {
    const homeScore = result.data.homeScore ?? match.homeScore ?? 0
    const awayScore = result.data.awayScore ?? match.awayScore ?? 0

    if (homeScore < 10 && awayScore < 10) {
      throw createError({
        statusCode: 400,
        message: 'Cannot mark match as COMPLETED: one team must reach 10 goals to win'
      })
    }
  }

  // Update match
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: result.data,
    include: {
      homeTeam: {
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
      },
      awayTeam: {
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
      }
    }
  })

  // Auto-update tournament status
  await updateTournamentStatus(match.tournamentId)

  return {
    success: true,
    match: updatedMatch
  }
})
