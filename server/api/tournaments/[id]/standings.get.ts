export default defineEventHandler(async (event) => {
  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  // Verify tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  })

  if (!tournament) {
    throw createError({
      statusCode: 404,
      message: 'Tournament not found'
    })
  }

  // Calculate standings
  const standings = await calculateStandings(tournamentId)

  return {
    success: true,
    standings
  }
})
