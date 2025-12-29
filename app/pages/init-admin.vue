<template>
  <NuxtLayout>
    <div class="min-h-[calc(100vh-20rem)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-box flex items-center justify-center shadow-strong">
              <span class="text-5xl">🔐</span>
            </div>
          </div>
          <h1 class="text-4xl font-bold mb-2">
            <span class="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              Initialize Admin
            </span>
          </h1>
          <p class="text-gray-600">Create the first administrator account</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-box shadow-strong p-8 border-2 border-gray-100">
          <div v-if="success" class="space-y-4">
            <div class="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 text-green-700 px-4 py-4 rounded-field">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">✓</span>
                <span class="font-bold text-lg">Admin created successfully!</span>
              </div>
              <p class="text-sm ml-8">
                You can now login with your credentials.
              </p>
              <p v-if="countdown > 0" class="text-sm ml-8 mt-2 font-semibold flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Auto-redirect in {{ countdown }} second{{ countdown > 1 ? 's' : '' }}...</span>
              </p>
            </div>
            <NuxtLink
              to="/login"
              @click="cancelRedirect"
              class="w-full py-3 rounded-field text-base font-bold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-medium transition-all transform hover:scale-[1.02] flex items-center justify-center"
            >
              Go to Login
            </NuxtLink>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-5">
            <div v-if="error" class="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-field flex items-center space-x-2">
              <span class="text-xl">⚠️</span>
              <span class="font-medium">{{ error }}</span>
            </div>

            <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 text-yellow-800 px-4 py-3 rounded-field">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-lg">⚠️</span>
                <span class="font-bold text-sm">Important</span>
              </div>
              <p class="text-xs ml-7">This endpoint only works if no admin exists yet. After the first admin is created, use Prisma Studio to promote other users.</p>
            </div>

            <div>
              <label for="username" class="block text-sm font-bold text-gray-700 mb-2">
                Username *
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                minlength="3"
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                placeholder="admin"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-bold text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all outline-none"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-bold text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                minlength="8"
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                placeholder="••••••••"
              />
              <p class="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                <span>🔒</span>
                <span>Minimum 8 characters</span>
              </p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-bold text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                minlength="8"
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 rounded-field text-base font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white hover:from-primary-600 hover:via-secondary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span v-if="loading" class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Admin...</span>
              </span>
              <span v-else>Create Admin Account</span>
            </button>

            <div class="text-center pt-4">
              <NuxtLink to="/" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                ← Back to Home
              </NuxtLink>
            </div>
          </form>
        </div>

        <!-- Alternative Method Card -->
        <div class="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-box p-6 border-2 border-gray-200 shadow-soft">
          <h3 class="font-bold mb-3 text-sm flex items-center space-x-2">
            <span class="text-lg">💡</span>
            <span>Alternative Method:</span>
          </h3>
          <ol class="text-xs text-gray-700 space-y-2 list-decimal list-inside">
            <li>Register a normal account at <NuxtLink to="/register" class="font-semibold text-primary-600 hover:text-primary-700">/register</NuxtLink></li>
            <li>Run <code class="bg-gray-300 px-2 py-1 rounded text-gray-800 font-mono">npx prisma studio</code></li>
            <li>Open the "users" table</li>
            <li>Change the role from "USER" to "ADMIN"</li>
            <li>Login with your account</li>
          </ol>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { navigateTo } from 'nuxt/app'

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const countdown = ref(0)
let redirectTimer: NodeJS.Timeout | null = null
let countdownInterval: NodeJS.Timeout | null = null

// Check on mount if admin already exists, redirect to home if so
onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/admin-exists')
    if (response.adminExists) {
      // Admin already exists, redirect to home
      navigateTo('/')
    }
  } catch (e) {
    console.error('Failed to check admin existence:', e)
  }
})

// Cleanup timers on unmount
onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
  if (countdownInterval) clearInterval(countdownInterval)
})

const startRedirectCountdown = () => {
  countdown.value = 5 // 5 seconds countdown

  // Update countdown every second
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownInterval) {
      clearInterval(countdownInterval)
    }
  }, 1000)

  // Redirect after 5 seconds
  redirectTimer = setTimeout(() => {
    navigateTo('/login')
  }, 5000)
}

const cancelRedirect = () => {
  // Cancel the automatic redirect
  if (redirectTimer) {
    clearTimeout(redirectTimer)
    redirectTimer = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  countdown.value = 0
}

const handleSubmit = async () => {
  error.value = ''

  // Validate passwords match
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const response = await $fetch('/api/auth/init-admin', {
      method: 'POST',
      body: {
        email: form.email,
        username: form.username,
        password: form.password
      }
    })

    if (response.success) {
      success.value = true
      form.username = ''
      form.email = ''
      form.password = ''
      form.confirmPassword = ''

      // Start the countdown for automatic redirect
      startRedirectCountdown()
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to create admin account'
  } finally {
    loading.value = false
  }
}
</script>
