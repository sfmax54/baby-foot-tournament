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

    await page.waitForTimeout(2000)
    // Fill in the form using IDs
    
    const username = page.locator("#username")
    await username.click()
    await username.pressSequentially('admin')
    await expect(page.locator('#username')).toHaveValue('admin')
    await page.fill('#email', 'admin@example.com')
    await expect(page.locator('#email')).toHaveValue('admin@example.com')
    await page.fill('#password', 'admin123')
    await expect(page.locator('#password')).toHaveValue('admin123')
    await page.fill('#confirmPassword', 'admin123')
    await expect(page.locator('#confirmPassword')).toHaveValue('admin123')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for success message
    await expect(page.locator('text=Admin created successfully')).toBeVisible({timeout: 30*1000})
  })

  test('should not allow access to init-admin after admin exists', async ({ page }) => {
    // Create admin first
    await page.goto('/init-admin')

    await page.waitForTimeout(2000)


    await page.fill('#username', 'admin')
    await expect(page.locator('#username')).toHaveValue('admin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.fill('#confirmPassword', 'admin123')
    await page.click('button[type="submit"]')

    // Wait for success message
    await expect(page.locator('text=Admin created successfully')).toBeVisible()

    // Now navigate to home
    await page.goto('/')

    await page.waitForTimeout(2000)

    // Try to visit init-admin again
    await page.goto('/init-admin')

    await page.waitForTimeout(2000)

    // Should be redirected to home
    await expect(page).toHaveURL('/')
  })

  test('should show validation error for password mismatch', async ({ page }) => {
    await page.goto('/init-admin')

    await page.waitForTimeout(2000)

    await page.fill('#username', 'admin')
    await expect(page.locator('#username')).toHaveValue('admin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.fill('#confirmPassword', 'different')

    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })
})
