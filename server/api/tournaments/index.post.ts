export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const currentUser = getCurrentUser(event)

  const body = await readBody(event)

  // Validate input
  const result = createTournamentSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  const { name, description, date } = result.data

  // Create tournament
  const tournament = await prisma.tournament.create({
    data: {
      name,
      description,
      date: new Date(date),
      createdById: currentUser.userId
    },
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
