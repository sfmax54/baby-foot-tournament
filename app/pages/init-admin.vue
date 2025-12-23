<template>
  <NuxtLayout>
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="card">
        <div class="text-center mb-6">
          <div class="text-5xl mb-3">🔐</div>
          <h1 class="text-3xl font-bold mb-2">Initialize Admin</h1>
          <p class="text-sm text-gray-600">Create the first administrator account</p>
        </div>

        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          <div class="font-semibold mb-1">✓ Admin created successfully!</div>
          <div class="text-sm mb-3">You can now login with your credentials.</div>
          <NuxtLink to="/login" class="btn btn-primary w-full">
            Go to Login
          </NuxtLink>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <div class="font-semibold mb-1">⚠️ Important</div>
            <div>This endpoint only works if no admin exists yet. After the first admin is created, use Prisma Studio to promote other users.</div>
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              minlength="3"
              class="input"
              placeholder="admin"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password *
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

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="8"
              class="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary"
          >
            <span v-if="loading">Creating Admin...</span>
            <span v-else>Create Admin Account</span>
          </button>

          <div class="text-center">
            <NuxtLink to="/" class="text-sm text-gray-600 hover:text-gray-900">
              Back to Home
            </NuxtLink>
          </div>
        </form>
      </div>

      <div class="mt-6 card bg-gray-50">
        <h3 class="font-semibold mb-2 text-sm">Alternative Method:</h3>
        <ol class="text-xs text-gray-700 space-y-1 list-decimal list-inside">
          <li>Register a normal account at <NuxtLink to="/register" class="text-primary-600 hover:underline">/register</NuxtLink></li>
          <li>Run <code class="bg-gray-200 px-1 rounded">npx prisma studio</code></li>
          <li>Open the "users" table</li>
          <li>Change the role from "USER" to "ADMIN"</li>
          <li>Login with your account</li>
        </ol>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

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

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigateTo('/')
      }, 2000)
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to create admin account'
  } finally {
    loading.value = false
  }
}
</script>
