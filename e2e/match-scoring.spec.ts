import { test, expect } from './fixtures'

test.describe('Match Scoring', () => {
  async function setupTournamentWithMatches(page: any) {
    // Create admin
    await page.goto('/init-admin')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="email"]', 'admin@example.com')
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.nth(0).fill('admin123')
    await passwordFields.nth(1).fill('admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 5000 })

    // Create tournament
    await page.goto('/tournaments/new')
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

    // Switch to matches tab
    await page.click('button:has-text("Matches")')
  }

  test('should update match scores', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Click edit on first match
    await page.click('button:has-text("Edit")')

    // Update scores
    const scoreInputs = page.locator('input[type="number"]')
    await scoreInputs.nth(0).fill('10')
    await scoreInputs.nth(1).fill('5')

    // Save
    await page.click('button:has-text("Update Match")')

    // Should show updated scores
    await expect(page.locator('text=10')).toBeVisible()
    await expect(page.locator('text=5')).toBeVisible()
  })

  test('should not allow completing match without winner (10 goals)', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Edit match
    await page.click('button:has-text("Edit")')

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
    await page.click('button:has-text("Edit")')

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
    await expect(page.locator('text=COMPLETED')).toBeVisible()
  })

  test('should use mouse wheel to increment/decrement scores', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Edit match
    await page.click('button:has-text("Edit")')

    const firstScoreInput = page.locator('input[type="number"]').nth(0)

    // Focus the input
    await firstScoreInput.click()

    // Get initial value (should be 0 by default)
    const initialValue = await firstScoreInput.inputValue()
    expect(initialValue).toBe('0')

    // Scroll up to increment
    await firstScoreInput.hover()
    await page.mouse.wheel(0, -100)
    await page.waitForTimeout(200)

    // Check value increased
    const newValue = await firstScoreInput.inputValue()
    expect(parseInt(newValue)).toBeGreaterThan(0)

    // Scroll down to decrement
    await page.mouse.wheel(0, 100)
    await page.waitForTimeout(200)

    // Check value decreased
    const finalValue = await firstScoreInput.inputValue()
    expect(parseInt(finalValue)).toBeLessThan(parseInt(newValue))
  })

  test('should clamp scores between 0 and 10 with mouse wheel', async ({ page }) => {
    await setupTournamentWithMatches(page)

    await page.click('button:has-text("Edit")')
    const scoreInput = page.locator('input[type="number"]').nth(0)

    // Set to 10
    await scoreInput.fill('10')
    await scoreInput.click()

    // Try to scroll up (should stay at 10)
    await scoreInput.hover()
    await page.mouse.wheel(0, -100)
    await page.waitForTimeout(200)

    const valueAt10 = await scoreInput.inputValue()
    expect(valueAt10).toBe('10')

    // Set to 0
    await scoreInput.fill('0')
    await scoreInput.click()

    // Try to scroll down (should stay at 0)
    await page.mouse.wheel(0, 100)
    await page.waitForTimeout(200)

    const valueAt0 = await scoreInput.inputValue()
    expect(valueAt0).toBe('0')
  })

  test('should show celebration when all matches are completed', async ({ page }) => {
    await setupTournamentWithMatches(page)

    // Complete the match
    await page.click('button:has-text("Edit")')

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
    await page.click('button:has-text("Edit")')
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
    await page.click('button:has-text("Edit")')
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
    await expect(page.locator('text=Team Alpha')).toBeVisible()
  })
})
