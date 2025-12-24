import { test as base, Page, Locator, expect as playwrightExpect } from '@playwright/test'
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

// Helper function to click element safely (wait for visible, enabled, stable)
export async function clickElement(page: Page, selector: string, timeout: number = 5000) {
  const element = page.locator(selector)

  // Wait for element to be visible
  await element.waitFor({ state: 'visible', timeout })

  // Wait for element to be enabled (not disabled)
  await playwrightExpect(element).toBeEnabled({ timeout })

  // Wait for element to be stable (no animations)
  await element.waitFor({ state: 'attached', timeout })

  // Click the element
  await element.click()
}

// Alternative version that works with Locator
export async function clickLocator(locator: Locator, timeout: number = 5000) {
  // Wait for element to be visible
  await locator.waitFor({ state: 'visible', timeout })

  // Wait for element to be enabled
  await playwrightExpect(locator).toBeEnabled({ timeout })

  // Wait for element to be stable
  await locator.waitFor({ state: 'attached', timeout })

  // Click the element
  await locator.click()
}

// Helper function to simulate realistic typing
export async function typeText(page: Page, selector: string, text: string, delayMs: number = 5) {
  // Click on the input to focus it using safe click
  // await clickElement(page, selector)
  await page.locator(selector).click()
  await sleep(1000)

  // Clear existing content first
  await page.fill(selector, '')

  // Type each character with a delay
  for (const char of text) {
    await page.keyboard.type(char)
    await sleep(delayMs)
  }
}

// Alternative version that works with Locator instead of selector
export async function typeTextInLocator(locator: Locator, text: string, delayMs: number = 5) {
  // Click on the input to focus it using safe click
  await clickLocator(locator)

  // Clear existing content first
  await locator.fill('')

  // Type each character with a delay
  for (const char of text) {
    await locator.page().keyboard.type(char)
    await locator.page().waitForTimeout(delayMs)
  }
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

export async function sleep(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

// Helper function to select user from autocomplete
export async function selectUserFromAutocomplete(page: Page, inputSelector: string, searchTerm: string, userEmail: string) {
  // Click and focus the input
  const input = page.locator(inputSelector)
  await input.click()
  await sleep(200)

  // Clear and type the search term slowly to trigger autocomplete
  await input.fill('')  // Clear first

  // Type character by character with delay
  for (const char of searchTerm) {
    await page.keyboard.type(char)
    await sleep(100)
  }

  // Wait for the autocomplete dropdown to appear
  await sleep(1000)

  // Wait for the specific suggestion to be visible and click it
  const suggestion = page.locator(`button:has-text("${userEmail}")`)
  await suggestion.waitFor({ state: 'visible', timeout: 5000 })
  await suggestion.click()

  // Wait a bit for the selection to register
  await sleep(300)
}

export { expect } from '@playwright/test'
