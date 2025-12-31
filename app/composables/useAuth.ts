export const useAuth = () => {
  const user = useState<any>('user', () => null)
  const loading = useState<boolean>('authLoading', () => false)

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (response.success) {
        await fetchUser()
        return { success: true }
      }
      return { success: false, error: 'Login failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Login failed'
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (email: string, username: string, password: string) => {
    loading.value = true
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { email, username, password }
      })

      if (response.success) {
        return { success: true }
      }
      return { success: false, error: 'Registration failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Registration failed'
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await $fetch('/api/auth/me')
      if (response.success) {
        user.value = response.user
      }
    } catch (error) {
      user.value = null
    }
  }

  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser,
    isAdmin,
    isAuthenticated
  }
}
