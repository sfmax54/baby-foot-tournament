import { H3Event } from 'h3'
import { JwtPayload } from './jwt'

export function getCurrentUser(event: H3Event): JwtPayload {
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }
  return user
}

export function isAdmin(event: H3Event): boolean {
  const user = event.context.user
  return user?.role === 'ADMIN'
}

export function requireAdmin(event: H3Event): void {
  if (!isAdmin(event)) {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    })
  }
}
