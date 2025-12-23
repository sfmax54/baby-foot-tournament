<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <span class="text-2xl">⚽</span>
              <span class="text-xl font-bold text-primary-600">Baby-Foot Manager</span>
            </NuxtLink>

            <div v-if="isAuthenticated" class="ml-10 flex items-baseline space-x-4">
              <NuxtLink
                to="/tournaments"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                All Tournaments
              </NuxtLink>
              <NuxtLink
                v-if="!isAdmin"
                to="/join"
                class="px-3 py-2 rounded-md text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >
                Join Tournament
              </NuxtLink>
              <NuxtLink
                v-if="isAdmin"
                to="/tournaments/new"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Create Tournament
              </NuxtLink>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <template v-if="isAuthenticated">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-700">{{ user?.username }}</span>
                <span
                  v-if="isAdmin"
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800"
                >
                  ADMIN
                </span>
              </div>
              <button
                @click="logout"
                class="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn btn-secondary text-sm">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="btn btn-primary text-sm">
                Register
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-sm text-gray-400">
            &copy; 2025 Baby-Foot Tournament Manager. All rights reserved.
          </div>
          <div class="flex space-x-6">
            <NuxtLink
              to="/how-it-works"
              class="text-sm text-gray-400 hover:text-white transition-colors"
            >
              How It Works
            </NuxtLink>
            <a
              href="https://github.com"
              target="_blank"
              class="text-sm text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, logout, isAdmin, isAuthenticated, fetchUser } = useAuth()

// Fetch user on mount
onMounted(async () => {
  await fetchUser()
})
</script>
