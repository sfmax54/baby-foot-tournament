<template>
  <NuxtLayout>
    <div class="min-h-[calc(100vh-20rem)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-secondary-500 rounded-box flex items-center justify-center shadow-strong">
              <span class="text-4xl">🎯</span>
            </div>
          </div>
          <h1 class="text-4xl font-bold mb-2 text-gray-900">
              Join the Game
          </h1>
          <p class="text-gray-600">Create your account to get started</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-box shadow-strong p-8 border-2 border-gray-100">
          <div v-if="success" class="space-y-4">
            <div class="bg-green-50 border-2 border-green-300 text-green-700 px-4 py-4 rounded-field">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">✓</span>
                <span class="font-bold text-lg">Registration successful!</span>
              </div>
              <p class="text-sm ml-8">
                You can now login with your credentials.
              </p>
            </div>
            <NuxtLink
              to="/login"
              class="w-full py-3 rounded-field text-base font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-medium transition-all flex items-center justify-center"
            >
              Go to Login
            </NuxtLink>
          </div>

          <form v-else @submit.prevent="handleRegister" class="space-y-5">
            <div v-if="error" class="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-field flex items-center space-x-2">
              <span class="text-xl">⚠️</span>
              <span class="font-medium">{{ error }}</span>
            </div>

            <div>
              <label for="username" class="block text-sm font-bold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                minlength="3"
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                placeholder="johndoe"
              />
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
                minlength="8"
                class="w-full px-4 py-3 rounded-field border-2 border-gray-300 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all outline-none"
                placeholder="••••••••"
              />
              <p class="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                <span>🔒</span>
                <span>Minimum 8 characters</span>
              </p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 rounded-field text-base font-bold bg-secondary-500 text-white hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-medium transition-all"
            >
              <span v-if="loading" class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating account...</span>
              </span>
              <span v-else>Create Account</span>
            </button>
          </form>

          <div v-if="!success" class="mt-8 pt-6 border-t-2 border-gray-100">
            <p class="text-center text-sm text-gray-600">
              Already have an account?
              <NuxtLink to="/login" class="font-bold text-primary-600 hover:text-primary-700">
                Login here
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const { register, loading } = useAuth()

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const error = ref('')
const success = ref(false)

const handleRegister = async () => {
  error.value = ''
  success.value = false

  const result = await register(form.email, form.username, form.password)

  if (result.success) {
    success.value = true
    form.username = ''
    form.email = ''
    form.password = ''
  } else {
    error.value = result.error || 'Registration failed'
  }
}
</script>
