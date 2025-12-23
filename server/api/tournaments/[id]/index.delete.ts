export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  // Delete tournament (cascades to teams and matches)
  await prisma.tournament.delete({
    where: { id: tournamentId }
  })

  return {
    success: true,
    message: 'Tournament deleted successfully'
  }
})
