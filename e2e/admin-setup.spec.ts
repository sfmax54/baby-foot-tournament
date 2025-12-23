import { test, expect } from './fixtures'

test.describe('Admin Setup Flow', () => {
  test('should redirect to admin setup when no admin exists', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Should be redirected to /init-admin
    await expect(page).toHaveURL('/init-admin')
    await expect(page.locator('h1')).toContainText('Initialize Admin')
  })

  test('should create first admin account', async ({ page }) => {
    await page.goto('/init-admin')

    // Fill in the form
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="email"]', 'admin@example.com')
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.nth(0).fill('admin123')
    await passwordFields.nth(1).fill('admin123')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for success message
    await expect(page.locator('text=Admin account created successfully')).toBeVisible()

    // Should redirect to home after 2 seconds
    await page.waitForURL('/', { timeout: 5000 })
  })

  test('should not allow access to init-admin after admin exists', async ({ page }) => {
    // Create admin first
    await page.goto('/init-admin')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="email"]', 'admin@example.com')
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.nth(0).fill('admin123')
    await passwordFields.nth(1).fill('admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 5000 })

    // Try to visit init-admin again
    await page.goto('/init-admin')

    // Should be redirected to home
    await expect(page).toHaveURL('/')
  })

  test('should show validation error for password mismatch', async ({ page }) => {
    await page.goto('/init-admin')

    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="email"]', 'admin@example.com')
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.nth(0).fill('admin123')
    await passwordFields.nth(1).fill('different')

    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })
})
