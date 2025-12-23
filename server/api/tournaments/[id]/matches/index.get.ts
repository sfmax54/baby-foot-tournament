export default defineEventHandler(async (event) => {
  const tournamentId = getRouterParam(event, 'id')

  if (!tournamentId) {
    throw createError({
      statusCode: 400,
      message: 'Tournament ID required'
    })
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId },
    include: {
      homeTeam: {
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
        }
      },
      awayTeam: {
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
        }
      }
    },
    orderBy: {
      matchNumber: 'asc'
    }
  })

  return {
    success: true,
    matches
  }
})
