export default defineEventHandler(async (event) => {
  // Check if user is authenticated (via context set by middleware)
  const currentUser = event.context.user

  // If no user in context, return not authenticated (no error)
  if (!currentUser) {
    return {
      success: false,
      user: null,
      authenticated: false
    }
  }

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
    return {
      success: false,
      user: null,
      authenticated: false
    }
  }

  return {
    success: true,
    user,
    authenticated: true
  }
})
