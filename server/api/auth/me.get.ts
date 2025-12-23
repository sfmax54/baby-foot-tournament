export default defineEventHandler(async (event) => {
  const currentUser = getCurrentUser(event)

  // Get full user details from database
  const user = await prisma.user.findUnique({
    where: { id: currentUser.userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  return {
    success: true,
    user
  }
})
