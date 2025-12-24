import { test as base } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to clean database
async function cleanDatabase() {
  await prisma.teamMember.deleteMany()
  await prisma.match.deleteMany()
  await prisma.team.deleteMany()
  await prisma.tournament.deleteMany()
  await prisma.user.deleteMany()
}

export const test = base.extend({
  // Reset database before each test
  page: async ({ page }, use) => {
    // Clean database before test
    await cleanDatabase()

    await use(page)

    // Clean database after test
    await cleanDatabase()
  },
})

export { expect } from '@playwright/test'
