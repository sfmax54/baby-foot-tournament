export default defineNuxtRouteMiddleware(async (to) => {
  // Skip if already on init-admin page
  if (to.path === '/init-admin') {
    return
  }

  // Check if an admin exists
  try {
    const response = await $fetch('/api/auth/admin-exists')

    // If no admin exists, redirect to init-admin page
    if (!response.adminExists) {
      return navigateTo('/init-admin')
    }
  } catch (error) {
    // If API call fails, allow normal navigation
    console.error('Failed to check admin existence:', error)
  }
})
