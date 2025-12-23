export default defineEventHandler(async (event) => {
  // Get tournaments that are UPCOMING and open for registration
  const tournaments = await prisma.tournament.findMany({
    where: {
      status: 'UPCOMING'
    },
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      },
      teams: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          teams: true,
          matches: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  return {
    success: true,
    tournaments
  }
})
