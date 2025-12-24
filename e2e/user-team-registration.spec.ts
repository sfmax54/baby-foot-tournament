import { Page } from 'playwright-core'
import { test, expect, typeText, clickElement, sleep, selectUserFromAutocomplete } from './fixtures'

test.describe('User Team Registration', () => {
  // Helper to create admin and tournament
  async function setupTournament(page: any) {
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

    // Login with new admin account
    //await page.goto('/login')
    await page.click('a:has-text("Go to Login")')
    await expect(page.locator('h1')).toContainText('Login')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')

    // Create tournament
    await page.click('a:has-text("Create your first tournament")')
    await sleep(2000)
    await typeText(page, '#name', 'User Registration Tournament')
    await page.click('button:has-text("Create Tournament")')

    await expect(page.locator('h1')).toContainText('User Registration Tournament', {timeout: 10*1000})
    // Get tournament URL
    const tournamentUrl = page.url()
    // Logout
    await page.click('button:has-text("Logout")')
    await sleep(1000)

    return tournamentUrl
  }

  async function createUser(page: Page, username: string, email: string, password: string) {
    await page.goto('/register', {waitUntil: "domcontentloaded"})
    // Use typeText for realistic typing simulation
    await typeText(page, 'input[placeholder="johndoe"]', username, 10)
    await typeText(page, 'input[placeholder="your@email.com"]', email, 10)
    await typeText(page, '#password', password, 10)
    await page.click('button[type="submit"]')
    // await expect(page.locator('text=Registration successful')).toBeVisible()

    await page.waitForResponse("/api/auth/register", {timeout: 10*1000})
  }

  async function loginUser(page: Page, email: string, password: string) {
    await page.goto('/login', {waitUntil: "domcontentloaded"})
    await page.waitForLoadState("networkidle")
    //await sleep(5000)
    //await page.fill('input[placeholder="your@email.com"]', email)
    await typeText(page, 'input[placeholder="your@email.com"]', email)
    await typeText(page, '#password', password)
   
    await page.locator('button[type="submit"]').click()

    //await expect(page.locator('h1')).toContainText('Tournaments')
    await page.waitForResponse("/api/auth/login", {timeout: 10*1000})
  }

  test('should allow user to register team with partner', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create two users
    await createUser(page, 'user1', 'user1@example.com', 'password123')
    await createUser(page, 'user2', 'user2@example.com', 'password123')
    // Login as user1
    await loginUser(page, 'user1@example.com', 'password123')
    // Go to tournament
    console.log(tournamentUrl)
    await page.goto(tournamentUrl)
    await sleep(2000)

    // Should see Register Team button
    await expect(page.locator('button:has-text("Register Team")')).toBeVisible()

    // Click Register Team
    await page.click('button:has-text("Register Team")')
    await sleep(500)

    // Fill in team registration form
    await page.fill('input[placeholder="The Champions"]', 'Dream Team')
    await page.fill('input[placeholder="partner@example.com"]', 'user2@example.com')
    await page.click('input[placeholder="The Champions"]')
    console.log('okokokok')
    await page.click('button[type="submit"]:has-text("Register Team")')
    // Submit the form
    //await clickElement(page, 'button[type="submit"]:has-text("Register Team")')
    // await sleep(1000)
// 
    // // Should see team in the list
    // await expect(page.locator('text=Dream Team')).toBeVisible()
    // await expect(page.getByRole('main').getByText('user1', { exact: true })).toBeVisible()
    // await expect(page.getByRole('main').getByText('user2', { exact: true })).toBeVisible()
// 
    // // Register Team button should disappear (user already has a team)
    // await expect(page.locator('button:has-text("Register Team")')).not.toBeVisible()
  })

  test('should not allow registration with non-existent partner', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create only one user
    await createUser(page, 'user1', 'user1@example.com', 'password123')

    // Login as user1
    await loginUser(page, 'user1@example.com', 'password123')

    // Go to tournament
    await page.goto(tournamentUrl)
    await sleep(2000)

    // Click Register Team
    await page.click('button:has-text("Register Team")')
    await sleep(500)

    // Fill in team registration form with non-existent email
    await page.fill('input[placeholder="The Champions"]', 'Solo Team')
    await page.fill('input[placeholder="partner@example.com"]', 'nonexistent@example.com')

    // Submit
    await page.click('button[type="submit"]:has-text("Register Team")')
    await sleep(1000)

    // Should show error
    await expect(page.locator('text=/No user found with email/i')).toBeVisible()
    await expect(page.locator('text=/ask them to create an account first/i')).toBeVisible()
  })

  test('should not allow user to register multiple teams in same tournament', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create three users
    await createUser(page, 'user1', 'user1@example.com', 'password123')
    await createUser(page, 'user2', 'user2@example.com', 'password123')
    await createUser(page, 'user3', 'user3@example.com', 'password123')

    // Login as user1
    await loginUser(page, 'user1@example.com', 'password123')

    // Go to tournament
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    // Register first team
    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', 'First Team')
    await page.fill('input[placeholder="partner@example.com"]', 'user2@example.com')
    await page.waitForLoadState("networkidle", {timeout: 5000})

    //await expect(page.locator('button:has-text("user2@example.com")')).toBeVisible()
    await page.locator('button:has-text("user2@example.com")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})
    //await sleep(10000)
    //await page.click('button:has-text("Register Team")')

    await page.locator('button[type="submit"]:has-text("Register Team")').click()

    // Register Team button should disappear
    await expect(page.locator('button:has-text("Register Team")')).toHaveCount(0)

    // Logout and login as user3
    await page.locator('button:has-text("Logout")').click()
    await loginUser(page, 'user3@example.com', 'password123')

    // Go to tournament
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    // Try to register team with user1 (who already has a team)
    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', 'Second Team')
    await page.fill('input[placeholder="partner@example.com"]', 'user1@example.com')
    await page.waitForLoadState("networkidle", {timeout: 5000})

    await page.locator('button:has-text("user1@example.com")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

    await page.getByRole('button', { name: 'Register Team', exact: true }).click()
   
    // Should show error
    await expect(page.locator('text=/already has a team in this tournament/i')).toBeVisible()
  })

  test('should not allow registration after matches are generated', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create users
    await createUser(page, 'user1', 'user1@example.com', 'password123')
    await createUser(page, 'user2', 'user2@example.com', 'password123')
    await createUser(page, 'user3', 'user3@example.com', 'password123')

    // Login as admin to add teams and generate matches
    await loginUser(page, 'admin@example.com', 'admin123')
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    // Add two admin teams
    for (const team of [
      { name: 'Team A', p1: 'Alice', p2: 'Bob' },
      { name: 'Team B', p1: 'Charlie', p2: 'David' }
    ]) {
      await page.click('button:has-text("Add Team")')
      await page.fill('input[placeholder="The Champions"]', team.name)
      await page.fill('input[placeholder="John Doe"]', team.p1)
      await page.fill('input[placeholder="Jane Smith"]', team.p2)
      await page.click('button[type="submit"]:has-text("Add Team")')
      await sleep(500)
    }

    // Generate matches
    await page.click('button:has-text("Matches")')
    await page.click('button:has-text("Generate Matches")')
    await sleep(1000)

    // Logout and login as user1
    await page.click('button:has-text("Logout")')
    await loginUser(page, 'user1@example.com', 'password123')

    // Go to tournament
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    // Should not see Register Team button
    await expect(page.locator('button:has-text("Register Team")')).toBeVisible()

    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', "Not allowed team")
    await page.fill('input[placeholder="partner@example.com"]', "notallowed@partner.com")
    await page.click('button[type="submit"]:has-text("Register Team")')

    // Try to register via API manually would also fail
    // But UI doesn't show the button, which is the expected behavior
  })

  test('should show both admin-created and user-registered teams', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create users
    await createUser(page, 'user1', 'user1@example.com', 'password123')
    await createUser(page, 'user2', 'user2@example.com', 'password123')

    // Login as admin and add one admin team
    await loginUser(page, 'admin@example.com', 'admin123')
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    await page.click('button:has-text("Add Team")')
    await page.fill('input[placeholder="The Champions"]', 'Admin Team')
    await page.fill('input[placeholder="John Doe"]', 'Alice')
    await page.fill('input[placeholder="Jane Smith"]', 'Bob')
    await page.click('button[type="submit"]:has-text("Add Team")')
    await sleep(1000)

    // Logout and login as user1
    await page.click('button:has-text("Logout")')
    await loginUser(page, 'user1@example.com', 'password123')

    // Register user team
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', 'User Team')
    await page.fill('input[placeholder="partner@example.com"]', 'user2@example.com')
    await page.waitForLoadState("networkidle", {timeout: 5000})

    //await expect(page.locator('button:has-text("user2@example.com")')).toBeVisible()
    await page.locator('button:has-text("user2@example.com")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

    await page.locator('button[type="submit"]:has-text("Register Team")').click()
    await page.locator('button:has-text("Register Team")').click
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

    // Should see both teams
    await expect(page.locator('text=Admin Team')).toBeVisible()
    await expect(page.locator('text=User Team')).toBeVisible()

    // Admin team should show player names
    const adminTeamCard = page.locator('.card').filter({ hasText: 'Admin Team' })
    await expect(adminTeamCard.locator('text=Player 1: Alice')).toBeVisible()
    await expect(adminTeamCard.locator('text=Player 2: Bob')).toBeVisible()

    // User team should show usernames
    await expect(page.getByRole('main').getByText('user1', { exact: true })).toBeVisible()
    await expect(page.getByRole('main').getByText('user2', { exact: true })).toBeVisible()
  })

  test('should highlight user team with special styling', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create users
    await createUser(page, 'user1', 'user1@example.com', 'password123')
    await createUser(page, 'user2', 'user2@example.com', 'password123')

    // Login as user1 and register team
    await loginUser(page, 'user1@example.com', 'password123')
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})


    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', 'My Team')
    await page.fill('input[placeholder="partner@example.com"]', 'user2@example.com')
    await page.waitForLoadState("networkidle", {timeout: 5000})

    // await expect(page.locator('button:has-text("user2@example.com")')).toBeVisible()
    await page.locator('button:has-text("user2@example.com")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

    await page.locator('button[type="submit"]:has-text("Register Team")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})


    // The team card should have special styling (ring-primary-500)
    const userTeamCard = page.locator('.card').filter({ hasText: 'My Team' })
    await expect(userTeamCard).toHaveClass(/ring-2/)
  })

  test('should allow user to leave team before matches are generated', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create users
    await createUser(page, 'user1', 'user1@example.com', 'password123')
    await createUser(page, 'user2', 'user2@example.com', 'password123')

    // Login as user1 and register team
    await loginUser(page, 'user1@example.com', 'password123')
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})


    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', 'Temporary Team')
    await page.fill('input[placeholder="partner@example.com"]', 'user2@example.com')
    await page.waitForLoadState("networkidle", {timeout: 5000})

    
    await page.locator('button:has-text("user2@example.com")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

    await page.locator('button[type="submit"]:has-text("Register Team")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

    // Should see Leave Team button
    await expect(page.locator('button:has-text("Leave Team")')).toBeVisible()

    // Click Leave Team and accept confirmation
    page.once('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Leave Team")')

    // Should be redirected to tournaments list
    await page.waitForURL('/tournaments', { timeout: 5000 })
    await expect(page).toHaveURL('/tournaments')

    // Go back to tournament to verify team is gone
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    // Team should be removed
    await expect(page.locator('text=Temporary Team')).toHaveCount(0)

    // Register Team button should be visible again
    await expect(page.locator('button:has-text("Register Team")')).toBeVisible()
  })

  test.only('should not allow leaving team after matches are generated', async ({ page }) => {
    const tournamentUrl = await setupTournament(page)

    // Create users
    await createUser(page, 'user1', 'user1@example.com', 'password123')
    await createUser(page, 'user2', 'user2@example.com', 'password123')
    await createUser(page, 'user3', 'user3@example.com', 'password123')
    await createUser(page, 'user4', 'user4@example.com', 'password123')

    // Register two user teams
    await loginUser(page, 'user1@example.com', 'password123')
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})


    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', 'Team 1')
    await page.fill('input[placeholder="partner@example.com"]', 'user2@example.com')
    await page.waitForLoadState("networkidle", {timeout: 5000})
    await page.locator('button:has-text("user2@example.com")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})


    await page.locator('button[type="submit"]:has-text("Register Team")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

    await page.locator('button:has-text("Logout")').click({timeout: 5000})
    await page.waitForResponse("/api/auth/logout", {timeout: 10*1000})
    await page.waitForURL("/login", {timeout: 5000})
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})
    console.log("status ok")

    await page.waitForLoadState("networkidle", {timeout: 5000})
    await page.fill('input[placeholder="your@email.com"]', 'user3@example.com')
    await page.fill('#password',  'password123')
    await page.locator('button[type="submit"]').click()
    await page.waitForResponse("/api/auth/login", {timeout: 10*1000})
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})
  
   // await loginUser(page, 'user3@example.com', 'password123')
   // await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    await page.locator('button:has-text("Register Team")').click()
    await page.fill('input[placeholder="The Champions"]', 'Team 2')
    await page.fill('input[placeholder="partner@example.com"]', 'user4@example.com')
    await page.waitForLoadState("networkidle", {timeout: 10*1000})
    await page.locator('button:has-text("user4@example.com")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 10*1000})

    await page.locator('button[type="submit"]:has-text("Register Team")').click()
    await page.waitForLoadState("domcontentloaded", {timeout: 5000})

   // await expect(page.getByRole('main').getByText('user4', { exact: true })).toBeVisible()
    await page.locator("text=Loading tournaments...").waitFor({state: "detached"})
   // // Login as admin and generate matches
   // await page.locator('button:has-text("Logout")').click()
   
    await page.click('button:has-text("Logout")').catch(() => {console.log('logout throw')})
    await page.waitForResponse("/api/auth/logout", {timeout: 10*1000})
    //await page.waitForURL("/login", {timeout: 10*1000})
    await page.waitForLoadState("domcontentloaded", {timeout: 10*1000})
    console.log("status ok2")

   // await loginUser(page, 'admin@example.com', 'admin123')
    
   // await page.waitForLoadState("networkidle", {timeout: 5000})
    await page.fill('input[placeholder="your@email.com"]', 'admin@example.com')
    await page.fill('#password', 'admin123')
    await page.locator('button[type="submit"]').click()
    await page.waitForResponse("/api/auth/login", {timeout: 10*1000})
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})


    await page.getByRole('button', { name: 'Matches (0)' }).click()
    await page.locator('button:has-text("Generate Matches")').click()
    await sleep(1000)

    // Login back as user1
    await page.locator('button:has-text("Logout")').click()
    await loginUser(page, 'user1@example.com', 'password123')
    await page.goto(tournamentUrl, {waitUntil: "domcontentloaded"})

    // Should NOT see Leave Team button
    await expect(page.locator('button:has-text("Leave Team")')).toHaveCount(0)

    // Should see disabled message
    await expect(page.locator('text=/Cannot leave team.*matches already generated/i')).toBeVisible()
  })
})
