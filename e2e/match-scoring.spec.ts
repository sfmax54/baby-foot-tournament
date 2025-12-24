import { test, expect } from './fixtures'

test.describe('Match Scoring', () => {
  async function setupTournamentWithMatches(page: any) {
    // Create admin
    await page.goto('/init-admin')

    await page.waitForTimeout(2000)

    await page.fill('#username', 'admin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.fill('#confirmPassword', 'admin123')
    await page.click('button[type="submit"]')

    // Wait for success message
    await page.waitForSelector('text=Admin created successfully', { timeout: 5000 })

    // Login with new admin account
    //await page.goto('/login')
    await page.click('a:has-text("Go to Login")')
    await expect(page.locator('h1')).toContainText('Login')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')

    await page.waitForTimeout(2000)
    //await expect(page.locator('h1')).toContainText('Baby-Foot Tournament Manager')
    await page.click('a:has-text("Create your first tournament")')

    // Create tournament
    //await page.goto('/tournaments/new')

    await page.waitForTimeout(5000)
    await expect(page.locator('h1')).toContainText('Create Tournament')

    await page.fill('#name', 'Scoring Test Tournament')
    await page.click('button:has-text("Create Tournament")')
    await page.waitForURL(/\/tournaments\/.*/, { timeout: 5000 })

    // Add teams
    const teams = [
      { name: 'Team Alpha', p1: 'Alice', p2: 'Bob' },
      { name: 'Team Beta', p1: 'Charlie', p2: 'David' }
    ]

    for (const team of teams) {
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
  }

  test('should update match scores', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Click edit on first match
    await page.click('.card button')

    // Update scores
    const scoreInputs = page.locator('input[type="number"]')
    await scoreInputs.nth(0).fill('10')
    await scoreInputs.nth(1).fill('5')

    // Save
    await page.click('button:has-text("Update Match")')
    await page.waitForTimeout(500)

    // Should show updated scores
    await expect(page.locator(".card").locator('text=10')).toBeVisible()
    await expect(page.locator(".card").locator('text=5')).toBeVisible()
  })

  test('should not allow completing match without winner', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Edit match
    await page.click('.card button')

    // Set scores below 10
    const scoreInputs = page.locator('input[type="number"]')
    await scoreInputs.nth(0).fill('5')
    await scoreInputs.nth(1).fill('3')

    // Try to set status to COMPLETED
    await page.selectOption('select', 'COMPLETED')

    // Should show warning
    await expect(page.locator('text=/One team must reach 10 goals/i')).toBeVisible()

    // Try to update
    await page.click('button:has-text("Update Match")')

    // Should show error
    await expect(page.locator('text=/Cannot mark match as COMPLETED/i')).toBeVisible()
  })

  test('should allow completing match when team reaches 10 goals', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Edit match
    await page.click('.card button')

    // Set winning score
    const scoreInputs = page.locator('input[type="number"]')
    await scoreInputs.nth(0).fill('10')
    await scoreInputs.nth(1).fill('7')

    // Should show winner indicator
    await expect(page.locator('text=🏆 Winner!')).toBeVisible()

    // Set status to COMPLETED
    await page.selectOption('select', 'COMPLETED')

    // Update
    await page.click('button:has-text("Update Match")')

    // Should update successfully
    await page.waitForTimeout(500)
    await expect(page.getByText('COMPLETED').nth(1)).toBeVisible()
  })

  test('should show celebration when all matches are completed', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Edit match
    await page.click('.card button')

    const scoreInputs = page.locator('input[type="number"]')
    await scoreInputs.nth(0).fill('10')
    await scoreInputs.nth(1).fill('5')
    await page.selectOption('select', 'COMPLETED')
    await page.click('button:has-text("Update Match")')

    await page.waitForTimeout(1000)

    // Should show celebration banner
    await expect(page.locator('text=/🏆.*Tournament Complete/i')).toBeVisible()
  })

  test('should dismiss celebration banner when clicked', async ({ page }) => {
    await setupTournamentWithMatches(page)
   
    // Complete match
    await page.click('.card button')

    const scoreInputs = page.locator('input[type="number"]')
    await scoreInputs.nth(0).fill('10')
    await scoreInputs.nth(1).fill('5')
    await page.selectOption('select', 'COMPLETED')
    await page.click('button:has-text("Update Match")')
    await page.waitForTimeout(1000)
   
    // Banner should be visible
    const banner = page.locator('text=/Tournament Complete/i').first()
    await expect(banner).toBeVisible()

    // Click close button
    await page.click('button[title="Dismiss banner"]')

    // Banner should be hidden
    await expect(banner).not.toBeVisible()
  })

  test('should show final standings when tournament is complete', async ({ page }) => {
    await setupTournamentWithMatches(page)
  
    // Complete match
    await page.click('.card button')
    const scoreInputs = page.locator('input[type="number"]')
    await scoreInputs.nth(0).fill('10')
    await scoreInputs.nth(1).fill('5')
    await page.selectOption('select', 'COMPLETED')
    await page.click('button:has-text("Update Match")')
    await page.waitForTimeout(1000)
  
    // Click on standings tab
    await page.click('button:has-text("Standings")')
  
    // Should show winner
    await expect(page.locator('text=/🏆.*Champion/i')).toBeVisible()
    await expect(page.getByRole('strong').filter({ hasText: 'Team Alpha' })).toBeVisible()
  })
})
