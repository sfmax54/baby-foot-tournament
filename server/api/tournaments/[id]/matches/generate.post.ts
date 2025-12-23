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
    include: { matches: true }
  })

  if (!tournament) {
    throw createError({
      statusCode: 404,
      message: 'Tournament not found'
    })
  }

  // Check if matches already exist
  if (tournament.matches.length > 0) {
    throw createError({
      statusCode: 409,
      message: 'Matches already generated for this tournament'
    })
  }

  try {
    const matches = await createRoundRobinMatches(tournamentId)

    return {
      success: true,
      matchesCreated: matches.count,
      message: `Generated ${matches.count} matches`
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Failed to generate matches'
    })
  }
})
