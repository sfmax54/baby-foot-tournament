<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-soft border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-3 group">
              <div class="w-10 h-10 bg-primary-500 rounded-box flex items-center justify-center shadow-medium transform group-hover:scale-105 transition-transform">
                <span class="text-2xl">⚽</span>
              </div>
              <span class="text-2xl font-bold text-gray-900">Baby-Foot</span>
            </NuxtLink>

            <ClientOnly>
              <div v-if="isAuthenticated" class="ml-12 flex items-baseline space-x-2">
                <NuxtLink
                  to="/tournaments"
                  class="px-4 py-2 rounded-field text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  Tournaments
                </NuxtLink>
                <NuxtLink
                  v-if="!isAdmin"
                  to="/join"
                  class="px-4 py-2 rounded-field text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 shadow-soft transition-all"
                >
                  Join Tournament
                </NuxtLink>
                <NuxtLink
                  v-if="isAdmin"
                  to="/tournaments/new"
                  class="px-4 py-2 rounded-field text-sm font-medium bg-secondary-500 text-white hover:bg-secondary-600 shadow-soft transition-all"
                >
                  Create Tournament
                </NuxtLink>
              </div>
            </ClientOnly>
          </div>

          <ClientOnly>
            <div class="flex items-center space-x-4">
              <template v-if="isAuthenticated">
                <div class="flex items-center space-x-3 px-4 py-2 rounded-field bg-gray-100 border border-gray-200">
                  <div class="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                    {{ user?.username?.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ user?.username }}</span>
                  <span
                    v-if="isAdmin"
                    class="px-2 py-1 text-xs font-bold rounded-full bg-primary-100 text-primary-700 border border-primary-200"
                  >
                    ADMIN
                  </span>
                </div>
                <button
                  @click="logout"
                  class="px-4 py-2 rounded-field text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-soft"
                >
                  Logout
                </button>
              </template>
              <template v-else>
                <NuxtLink
                  to="/login"
                  class="px-4 py-2 rounded-field text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-soft"
                >
                  Login
                </NuxtLink>
                <NuxtLink
                  to="/register"
                  class="px-5 py-2 rounded-field text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 shadow-medium transition-all"
                >
                  Get Started
                </NuxtLink>
              </template>
            </div>
          </ClientOnly>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12 mt-20 border-t-4 border-primary-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div class="flex flex-col items-center md:items-start space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-500 rounded-box flex items-center justify-center shadow-strong">
                <span class="text-2xl">⚽</span>
              </div>
              <span class="text-xl font-bold text-white">Baby-Foot Tournament</span>
            </div>
            <div class="text-sm text-gray-400">
              &copy; 2025 Baby-Foot Manager. All rights reserved.
            </div>
          </div>
          <div class="flex space-x-8">
            <NuxtLink
              to="/how-it-works"
              class="text-sm text-gray-300 hover:text-primary-400 transition-colors font-medium"
            >
              How It Works
            </NuxtLink>
            <a
              href="https://github.com/sfmax54/baby-foot-tournament/"
              target="_blank"
              class="text-sm text-gray-300 hover:text-secondary-400 transition-colors font-medium"
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
const { user, logout, isAdmin, isAuthenticated } = useAuth()
</script>
