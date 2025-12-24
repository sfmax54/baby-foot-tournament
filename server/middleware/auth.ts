export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/init-admin', '/api/auth/admin-exists']
  if (publicRoutes.some(route => event.path.startsWith(route))) {
    return
  }

  // Skip auth for non-API routes
  if (!event.path.startsWith('/api/')) {
    return
  }

  // Extract token from cookie
  const token = getCookie(event, 'auth_token')

  // Special handling for /api/auth/me - optional auth
  if (event.path === '/api/auth/me') {
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        event.context.user = payload
      }
    }
    return
  }

  // For all other API routes, require authentication
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  const payload = verifyToken(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    })
  }

  // Attach user to event context
  event.context.user = payload
})
