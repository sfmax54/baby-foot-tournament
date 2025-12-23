export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = updateTournamentSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  const data = result.data

  // Convert date if provided
  if (data.date) {
    data.date = new Date(data.date) as any
  }

  // Update tournament
  const tournament = await prisma.tournament.update({
    where: { id: tournamentId },
    data,
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    }
  })

  return {
    success: true,
    tournament
  }
})
