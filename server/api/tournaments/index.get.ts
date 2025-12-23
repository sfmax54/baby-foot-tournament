export default defineEventHandler(async (event) => {
  const tournaments = await prisma.tournament.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true
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
      date: 'desc'
    }
  })

  return {
    success: true,
    tournaments
  }
})
