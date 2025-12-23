export default defineEventHandler(async (event) => {
  const matchId = getRouterParam(event, 'id')

  if (!matchId) {
    throw createError({
      statusCode: 400,
      message: 'Match ID required'
    })
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      tournament: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  if (!match) {
    throw createError({
      statusCode: 404,
      message: 'Match not found'
    })
  }

  return {
    success: true,
    match
  }
})
