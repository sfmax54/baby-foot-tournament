// IMPORTANT: This endpoint should be disabled in production
// or protected with a secret token

export default defineEventHandler(async (event) => {
  // Optional: Add a secret token check for production
  // const { secret } = await readBody(event)
  // if (secret !== process.env.ADMIN_INIT_SECRET) {
  //   throw createError({ statusCode: 403, message: 'Unauthorized' })
  // }

  // Check if an admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    throw createError({
      statusCode: 409,
      message: 'An admin user already exists. Use Prisma Studio to promote users.'
    })
  }

  const body = await readBody(event)
  const { email, username, password } = body

  if (!email || !username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email, username, and password are required'
    })
  }

  // Validate password length
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Password must be at least 8 characters'
    })
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'User with this email or username already exists'
    })
  }

  // Create admin user
  const hashedPassword = await hashPassword(password)

  const admin = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role: 'ADMIN'
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
    message: 'Admin user created successfully',
    user: admin
  }
})
