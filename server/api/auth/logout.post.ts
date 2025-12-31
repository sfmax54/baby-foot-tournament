export default defineEventHandler((event) => {
  // Delete the auth cookie with the same options as when it was set
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  return {
    success: true,
    message: 'Logged out successfully'
  }
})
