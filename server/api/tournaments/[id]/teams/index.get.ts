export default defineEventHandler(async (event) => {
  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  const teams = await prisma.team.findMany({
    where: { tournamentId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return {
    success: true,
    teams
  }
})
