<template>
  <NuxtLayout>
    <div class="max-w-md mx-auto px-4 py-12">
      <div class="card">
        <h1 class="text-3xl font-bold text-center mb-8">Login</h1>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
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
              class="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </form>

        <div class="mt-6 space-y-2">
          <p class="text-center text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
              Register here
            </NuxtLink>
          </p>
          <p class="text-center text-xs text-gray-500">
            Need to create the first admin?
            <NuxtLink to="/init-admin" class="text-primary-600 hover:text-primary-700 font-medium">
              Initialize Admin
            </NuxtLink>
          </p>
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
