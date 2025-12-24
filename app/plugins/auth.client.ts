export default defineNuxtPlugin(async () => {
  const { fetchUser } = useAuth()

  // Fetch user on app initialization (client-side only)
  await fetchUser()
})
