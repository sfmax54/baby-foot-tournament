export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const teamId = getRouterParam(event, 'id')

  if (!teamId) {
    throw createError({
      statusCode: 400,
      message: 'Team ID required'
    })
  }

  // Delete team (cascades to matches)
  await prisma.team.delete({
    where: { id: teamId }
  })

  return {
    success: true,
    message: 'Team deleted successfully'
  }
})
