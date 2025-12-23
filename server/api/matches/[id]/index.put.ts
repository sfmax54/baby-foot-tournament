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

  // Validate input
  const result = updateMatchSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  // Update match
  const match = await prisma.match.update({
    where: { id: matchId },
    data: result.data,
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

  return {
    success: true,
    match
  }
})
