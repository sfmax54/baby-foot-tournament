import { test as base } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const test = base.extend({
  // Reset database before each test
  page: async ({ page }, use) => {
    // Clean database
    await prisma.teamMember.deleteMany()
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.user.deleteMany()

    await use(page)
  },
})

export { expect } from '@playwright/test'
