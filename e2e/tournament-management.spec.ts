import { test, expect } from './fixtures'

test.describe('Tournament Management', () => {
  // Helper to create admin and login
  async function loginAsAdmin(page: any) {
    // Create admin account
    await page.goto('/init-admin')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="email"]', 'admin@example.com')
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.nth(0).fill('admin123')
    await passwordFields.nth(1).fill('admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 5000 })
  }

  async function createRegularUser(page: any, username: string, email: string) {
    // Logout if logged in
    const logoutButton = page.locator('button:has-text("Logout")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }

    // Register new user
    await page.goto('/')
    await page.click('text=Register')
    await page.fill('input[type="text"]', username)
    await page.fill('input[type="email"]', email)
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.nth(0).fill('password123')
    await passwordFields.nth(1).fill('password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 5000 })
  }

  test('should create a tournament as admin', async ({ page }) => {
    await loginAsAdmin(page)

    // Navigate to tournaments
    await page.goto('/tournaments')

    // Click create tournament
    await page.click('text=Create Tournament')
    await expect(page).toHaveURL('/tournaments/new')

    // Fill in tournament form
    await page.fill('#name', 'Summer Championship 2025')
    await page.fill('#description', 'Annual summer tournament')
    // Date is pre-filled with current date/time

    // Submit
    await page.click('button:has-text("Create Tournament")')

    // Should redirect to tournament detail page
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })
    await expect(page.locator('h1')).toContainText('Summer Championship 2025')
  })

  test('should not allow non-admin to create tournament', async ({ page }) => {
    await loginAsAdmin(page)
    await createRegularUser(page, 'user1', 'user1@example.com')

    // Try to access tournament creation page
    await page.goto('/tournaments/new')

    // Should be redirected away
    await expect(page).toHaveURL('/tournaments')
  })

  test('should add teams to tournament as admin', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament
    await page.goto('/tournaments/new')
    await page.fill('#name', 'Test Tournament')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    // Add first team
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder*="Team Rockets"]', 'Team Alpha')
    await page.fill('input[placeholder*="Alice"]', 'Alice')
    await page.fill('input[placeholder*="Bob"]', 'Bob')
    await page.click('button:has-text("Add Team"):not(:has-text("Add Team"))')

    // Wait for modal to close and team to appear
    await expect(page.locator('text=Team Alpha')).toBeVisible()

    // Add second team
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder*="Team Rockets"]', 'Team Beta')
    await page.fill('input[placeholder*="Alice"]', 'Charlie')
    await page.fill('input[placeholder*="Bob"]', 'David')
    await page.click('button:has-text("Add Team"):not(:has-text("Add Team"))')

    await expect(page.locator('text=Team Beta')).toBeVisible()
  })

  test('should generate matches for tournament', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament and add teams
    await page.goto('/tournaments/new')
    await page.fill('#name', 'Test Tournament')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    // Add 3 teams
    const teams = [
      { name: 'Team A', p1: 'Alice', p2: 'Bob' },
      { name: 'Team B', p1: 'Charlie', p2: 'David' },
      { name: 'Team C', p1: 'Eve', p2: 'Frank' }
    ]

    for (const team of teams) {
      await page.click('button:has-text("Add Team")')
      await page.fill('input[placeholder*="Team Rockets"]', team.name)
      await page.fill('input[placeholder*="Alice"]', team.p1)
      await page.fill('input[placeholder*="Bob"]', team.p2)
      await page.click('button:has-text("Add Team"):not(:has-text("Add Team"))')
      await page.waitForTimeout(500)
    }

    // Generate matches
    await page.click('button:has-text("Generate Matches")')

    // Wait for confirmation
    page.once('dialog', dialog => dialog.accept())

    // Switch to matches tab
    await page.click('button:has-text("Matches")')

    // Should show 3 matches (3 teams = 3 matches in round-robin)
    const matches = page.locator('[class*="border-l-4"]')
    await expect(matches).toHaveCount(3)
  })

  test('should lock registrations after matches are generated', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament and add 2 teams
    await page.goto('/tournaments/new')
    await page.fill('#name', 'Locked Tournament')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    for (const team of [{ name: 'Team 1', p1: 'A', p2: 'B' }, { name: 'Team 2', p1: 'C', p2: 'D' }]) {
      await page.click('button:has-text("Add Team")')
      await page.fill('input[placeholder*="Team Rockets"]', team.name)
      await page.fill('input[placeholder*="Alice"]', team.p1)
      await page.fill('input[placeholder*="Bob"]', team.p2)
      await page.click('button:has-text("Add Team"):not(:has-text("Add Team"))')
      await page.waitForTimeout(500)
    }

    // Generate matches
    await page.click('button:has-text("Generate Matches")')
    page.once('dialog', dialog => dialog.accept())
    await page.waitForTimeout(1000)

    // Try to add another team - should show warning or be disabled
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder*="Team Rockets"]', 'Team 3')
    await page.fill('input[placeholder*="Alice"]', 'E')
    await page.fill('input[placeholder*="Bob"]', 'F')
    await page.click('button:has-text("Add Team"):not(:has-text("Add Team"))')

    // Should show error
    await expect(page.locator('text=/Cannot add team.*matches/i')).toBeVisible()
  })

  test('should reset matches and allow new registrations', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament, add teams, and generate matches
    await page.goto('/tournaments/new')
    await page.fill('#name', 'Reset Test')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    for (const team of [{ name: 'Team 1', p1: 'A', p2: 'B' }, { name: 'Team 2', p1: 'C', p2: 'D' }]) {
      await page.click('button:has-text("Add Team")')
      await page.fill('input[placeholder*="Team Rockets"]', team.name)
      await page.fill('input[placeholder*="Alice"]', team.p1)
      await page.fill('input[placeholder*="Bob"]', team.p2)
      await page.click('button:has-text("Add Team"):not(:has-text("Add Team"))')
      await page.waitForTimeout(500)
    }

    await page.click('button:has-text("Generate Matches")')
    page.once('dialog', dialog => dialog.accept())
    await page.waitForTimeout(1000)

    // Reset matches
    await page.click('button:has-text("Reset Matches")')
    page.once('dialog', dialog => dialog.accept())
    await page.waitForTimeout(1000)

    // Switch to matches tab - should be empty
    await page.click('button:has-text("Matches")')
    await expect(page.locator('text=/No matches/i')).toBeVisible()

    // Now should be able to add new team
    await page.click('button:has-text("Teams")')
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder*="Team Rockets"]', 'Team 3')
    await page.fill('input[placeholder*="Alice"]', 'E')
    await page.fill('input[placeholder*="Bob"]', 'F')
    await page.click('button:has-text("Add Team"):not(:has-text("Add Team"))')

    await expect(page.locator('text=Team 3')).toBeVisible()
  })
})
