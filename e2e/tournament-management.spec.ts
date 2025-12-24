import { test, expect } from './fixtures'

test.describe('Tournament Management', () => {
  // Helper to create admin and login
  async function loginAsAdmin(page: any) {
    // Create admin account
    await page.goto('/init-admin')
    await page.waitForTimeout(2000)
    await page.fill('#username', 'admin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.fill('#confirmPassword', 'admin123')
    await page.click('button[type="submit"]')

    // Wait for success message
    await page.waitForSelector('text=Admin created successfully', { timeout: 5000 })

    // Navigate to home
    await page.click('a:has-text("Go to Login")')
    await expect(page.locator('h1')).toContainText('Login')

    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')

    await expect(page.locator('a:has-text("Create your first tournament")')).toBeVisible()
  }

  async function createRegularUser(page: any, username: string, email: string) {
    // Logout if logged in
    const logoutButton = page.locator('button:has-text("Logout")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }

    // Register new user
    await page.goto('/register')
    await page.waitForTimeout(2000)
    await page.fill('#username', username)
    await page.fill('#email', email)
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')

    // Wait for success message
    await page.waitForSelector('text=Registration successful', { timeout: 5000 })
  }

  test('should create a tournament as admin', async ({ page }) => {
    await loginAsAdmin(page)

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
    await expect(page.locator('a:has-text("Create your first tournament")')).not.toBeVisible();
  })

  test('should add teams to tournament as admin', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament
    await page.goto('/tournaments/new')
    await page.waitForTimeout(2000)
    await page.fill('#name', 'Test Tournament')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    // Add first team
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder="The Champions"]', 'Team Alpha')
    await page.fill('input[placeholder="John Doe"]', 'Alice')
    await page.fill('input[placeholder="Jane Smith"]', 'Bob')
    await page.click('button[type="submit"]:has-text("Add Team")')

    // Wait for modal to close and team to appear
    await expect(page.locator('text=Team Alpha')).toBeVisible({ timeout: 3000 })

    // Add second team
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder="The Champions"]', 'Team Beta')
    await page.fill('input[placeholder="John Doe"]', 'Charlie')
    await page.fill('input[placeholder="Jane Smith"]', 'David')
    await page.click('button[type="submit"]:has-text("Add Team")')

    await expect(page.locator('text=Team Beta')).toBeVisible({ timeout: 3000 })
  })

  test('should generate matches for tournament', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament and add teams
    await expect(page.locator('a:has-text("Create your first tournament")')).toBeVisible()
    await page.locator('a:has-text("Create your first tournament")').click()
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
      await page.fill('input[placeholder="The Champions"]', team.name)
      await page.fill('input[placeholder="John Doe"]', team.p1)
      await page.fill('input[placeholder="Jane Smith"]', team.p2)
      await page.click('button[type="submit"]:has-text("Add Team")')
      await page.waitForTimeout(500)
    }

    // Switch to matches tab first
    await page.click('button:has-text("Matches")')

    // Generate matches
    await page.click('button:has-text("Generate Matches")')

    // Wait for matches to generate
    await page.waitForTimeout(1000)

    // Should show 3 matches (3 teams = 3 matches in round-robin)
    const matchCards = page.locator('div').filter({ hasText: /Match #/ })
    await expect(matchCards.first()).toBeVisible({ timeout: 3000 })
  })

  test('should lock registrations after matches are generated', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament and add 2 teams
    await page.goto('/tournaments/new')
    await page.waitForTimeout(2000)
    await page.fill('#name', 'Locked Tournament')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    for (const team of [{ name: 'Team 1', p1: 'A', p2: 'B' }, { name: 'Team 2', p1: 'C', p2: 'D' }]) {
      await page.click('button:has-text("Add Team")')
      await page.fill('input[placeholder="The Champions"]', team.name)
      await page.fill('input[placeholder="John Doe"]', team.p1)
      await page.fill('input[placeholder="Jane Smith"]', team.p2)
      await page.click('button[type="submit"]:has-text("Add Team")')
      await page.waitForTimeout(500)
    }

    // Generate matches
    await page.click('button:has-text("Matches")')
    await page.click('button:has-text("Generate Matches")')
    await page.waitForTimeout(1000)

    // Switch back to teams tab
    await page.click('button:has-text("Teams")')

    // Try to add another team
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder="The Champions"]', 'Team 3')
    await page.fill('input[placeholder="John Doe"]', 'E')
    await page.fill('input[placeholder="Jane Smith"]', 'F')
    await page.click('button[type="submit"]:has-text("Add Team")')

    // Should show error
    await expect(page.locator('text=/Cannot add team.*matches/i')).toBeVisible()
  })

  test('should reset matches and allow new registrations', async ({ page }) => {
    await loginAsAdmin(page)

    // Create tournament, add teams, and generate matches
    await expect(page.locator('a:has-text("Create your first tournament")')).toBeVisible()
    await page.locator('a:has-text("Create your first tournament")').click()
    await page.fill('#name', 'Reset Test')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    for (const team of [{ name: 'Team 1', p1: 'A', p2: 'B' }, { name: 'Team 2', p1: 'C', p2: 'D' }]) {
      await page.click('button:has-text("Add Team")')
      await page.fill('input[placeholder="The Champions"]', team.name)
      await page.fill('input[placeholder="John Doe"]', team.p1)
      await page.fill('input[placeholder="Jane Smith"]', team.p2)
      await page.click('button[type="submit"]:has-text("Add Team")')
      await page.waitForTimeout(500)
    }

    await page.click('button:has-text("Matches")')
    await page.click('button:has-text("Generate Matches")')
    await page.waitForTimeout(1000)

    // Reset matches
    page.once('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Reset Matches")')
    page.once('dialog', dialog => dialog.accept())
    await page.waitForTimeout(1000)

    // Should show no matches message
    await expect(page.locator('text=/No matches/i')).toBeVisible()

    // Now should be able to add new team
    await page.click('button:has-text("Teams")')
    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder="The Champions"]', 'Team 3')
    await page.fill('input[placeholder="John Doe"]', 'E')
    await page.fill('input[placeholder="Jane Smith"]', 'F')
    await page.click('button[type="submit"]:has-text("Add Team")')

    await expect(page.locator('text=Team 3')).toBeVisible()
  })
})
