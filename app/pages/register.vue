<template>
  <NuxtLayout>
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="card">
        <h1 class="text-3xl font-bold text-center mb-8">Register</h1>

        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          <div class="font-semibold mb-1">✓ Registration successful!</div>
          <div class="text-sm mb-3">
            You can now login with your credentials.
          </div>
          <NuxtLink to="/login" class="btn btn-primary w-full">
            Go to Login
          </NuxtLink>
        </div>

        <form v-else @submit.prevent="handleRegister" class="space-y-6">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              minlength="3"
              class="input"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="input"
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary"
          >
            <span v-if="loading">Registering...</span>
            <span v-else>Register</span>
          </button>
        </form>

        <p class="text-center mt-6 text-sm text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Login here
          </NuxtLink>
        </p>
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
