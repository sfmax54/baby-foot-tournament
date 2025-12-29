<template>
  <NuxtLayout>
    <div class="min-h-[calc(100vh-20rem)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-box flex items-center justify-center shadow-strong">
              <span class="text-4xl">⚽</span>
            </div>
          </div>
          <h1 class="text-4xl font-bold mb-2">
            <span class="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p class="text-gray-600">Login to manage your tournaments</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-box shadow-strong p-8 border-2 border-gray-100">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div v-if="error" class="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-field flex items-center space-x-2">
              <span class="text-xl">⚠️</span>
              <span class="font-medium">{{ error }}</span>
            </div>

            <div>
              <label for="email" class="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                placeholder="your@email.com"
                autocomplete="email"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 rounded-field text-base font-bold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span v-if="loading" class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging in...</span>
              </span>
              <span v-else>Login to Account</span>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t-2 border-gray-100 space-y-3">
            <p class="text-center text-sm text-gray-600">
              Don't have an account?
              <NuxtLink to="/register" class="font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hover:from-primary-700 hover:to-secondary-700">
                Create Account
              </NuxtLink>
            </p>
            <p class="text-center text-xs text-gray-500">
              Need to create the first admin?
              <NuxtLink to="/init-admin" class="font-semibold text-accent-600 hover:text-accent-700">
                Initialize Admin
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { login, loading } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const error = ref('')

const handleLogin = async () => {
  error.value = ''
  const result = await login(form.email, form.password)

  if (result.success) {
    router.push('/tournaments')
  } else {
    error.value = result.error || 'Login failed'
  }
}
</script>
