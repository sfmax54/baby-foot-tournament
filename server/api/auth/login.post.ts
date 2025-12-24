export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  const { email, password } = result.data

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Generate JWT token
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  // Set cookie
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  }
})
