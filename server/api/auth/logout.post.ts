export default defineEventHandler((event) => {
  // Delete the auth cookie
  deleteCookie(event, 'auth_token', {
    path: '/'
  })

  return {
    success: true,
    message: 'Logged out successfully'
  }
})
