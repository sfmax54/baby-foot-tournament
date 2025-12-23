export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const teamId = getRouterParam(event, 'id')

  if (!teamId) {
    throw createError({
      statusCode: 400,
      message: 'Team ID required'
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = updateTeamSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  // Update team
  const team = await prisma.team.update({
    where: { id: teamId },
    data: result.data,
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
