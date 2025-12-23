import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  // Check if any admin user exists
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  return {
    adminExists: !!adminExists
  }
})
