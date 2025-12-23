export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.errors
    })
  }

  const { email, username, password } = result.data

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'User already exists'
    })
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: 'USER' // Default role
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true
    }
  })

  return {
    success: true,
    user
  }
})
