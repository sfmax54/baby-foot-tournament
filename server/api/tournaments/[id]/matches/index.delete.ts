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

  // Delete all matches for this tournament
  const deleteResult = await prisma.match.deleteMany({
    where: { tournamentId }
  })

  // Reset tournament status to UPCOMING if it was auto-updated
  if (tournament.status !== 'UPCOMING') {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'UPCOMING' }
    })
  }

  return {
    success: true,
    deletedCount: deleteResult.count,
    message: `Deleted ${deleteResult.count} matches. You can now add new teams or regenerate matches.`
  }
})
