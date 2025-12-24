export default defineEventHandler(async (event) => {
  // Require authentication to see users list
  getCurrentUser(event)

  // Get all users with basic info
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true
    },
    orderBy: {
      username: 'asc'
    }
  })

  return {
    success: true,
    users
  }
})
