<template>
  <NuxtLayout>
    <div class="relative overflow-hidden">
      <!-- Hero Section with Gradient Background -->
      <div class="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-20 sm:py-32">
        <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div class="text-center">
            <div class="flex justify-center mb-8">
              <div class="w-24 h-24 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-box flex items-center justify-center shadow-strong animate-pulse">
                <span class="text-6xl">⚽</span>
              </div>
            </div>
            <h1 class="text-6xl md:text-7xl font-bold mb-6">
              <span class="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                Baby-Foot Tournament
              </span>
            </h1>
            <p class="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto font-medium">
              Organize and manage your foosball tournaments with ease. Track scores, generate matches, and celebrate winners.
            </p>
            <div v-if="!isAuthenticated" class="flex flex-col sm:flex-row justify-center gap-4">
              <NuxtLink
                to="/register"
                class="px-10 py-4 rounded-box text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-strong transition-all transform hover:scale-105"
              >
                Get Started Free
              </NuxtLink>
              <NuxtLink
                to="/login"
                class="px-10 py-4 rounded-box text-lg font-bold bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-500 hover:text-primary-700 shadow-medium transition-all"
              >
                Login
              </NuxtLink>
            </div>
            <div v-else class="flex flex-col sm:flex-row justify-center gap-4">
              <NuxtLink
                v-if="isAdmin"
                to="/tournaments/new"
                class="px-10 py-4 rounded-box text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-strong transition-all transform hover:scale-105"
              >
                Create Tournament
              </NuxtLink>
              <NuxtLink
                v-else
                to="/join"
                class="px-10 py-4 rounded-box text-lg font-bold bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-strong transition-all transform hover:scale-105"
              >
                Join a Tournament
              </NuxtLink>
              <NuxtLink
                to="/tournaments"
                class="px-10 py-4 rounded-box text-lg font-bold bg-white text-gray-700 border-2 border-gray-300 hover:border-accent-500 hover:text-accent-700 shadow-medium transition-all"
              >
                View All Tournaments
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">
            <span class="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p class="text-xl text-gray-600">Powerful features to manage your tournaments</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="group relative bg-white rounded-box p-8 shadow-soft hover:shadow-strong transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-200">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-box opacity-20 transform rotate-12 group-hover:rotate-6 transition-transform"></div>
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-box flex items-center justify-center mb-6 shadow-medium">
                <span class="text-4xl">🏆</span>
              </div>
              <h3 class="text-2xl font-bold mb-3 text-gray-900">Create Tournaments</h3>
              <p class="text-gray-600 leading-relaxed">
                Set up tournaments with custom names, dates, and descriptions. Simple and intuitive interface.
              </p>
            </div>
          </div>

          <div class="group relative bg-white rounded-box p-8 shadow-soft hover:shadow-strong transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-secondary-200">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-box opacity-20 transform rotate-12 group-hover:rotate-6 transition-transform"></div>
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-box flex items-center justify-center mb-6 shadow-medium">
                <span class="text-4xl">👥</span>
              </div>
              <h3 class="text-2xl font-bold mb-3 text-gray-900">Manage Teams</h3>
              <p class="text-gray-600 leading-relaxed">
                Add teams and players to compete in your tournaments. Track performance and statistics.
              </p>
            </div>
          </div>

          <div class="group relative bg-white rounded-box p-8 shadow-soft hover:shadow-strong transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-accent-200">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-100 to-accent-200 rounded-box opacity-20 transform rotate-12 group-hover:rotate-6 transition-transform"></div>
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-box flex items-center justify-center mb-6 shadow-medium">
                <span class="text-4xl">⚡</span>
              </div>
              <h3 class="text-2xl font-bold mb-3 text-gray-900">Auto-Generate Matches</h3>
              <p class="text-gray-600 leading-relaxed">
                Automatic round-robin scheduling where every team plays each other. Fair and balanced.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 py-16 mb-0">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p class="text-xl text-white/90 mb-8">
            Join thousands of foosball enthusiasts managing their tournaments with ease.
          </p>
          <NuxtLink
            v-if="!isAuthenticated"
            to="/register"
            class="inline-block px-10 py-4 rounded-box text-lg font-bold bg-white text-primary-700 hover:bg-gray-50 shadow-strong transition-all transform hover:scale-105"
          >
            Create Free Account
          </NuxtLink>
          <NuxtLink
            v-else
            :to="isAdmin ? '/tournaments/new' : '/join'"
            class="inline-block px-10 py-4 rounded-box text-lg font-bold bg-white text-primary-700 hover:bg-gray-50 shadow-strong transition-all transform hover:scale-105"
          >
            {{ isAdmin ? 'Create Your First Tournament' : 'Join Your First Tournament' }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { isAuthenticated, isAdmin } = useAuth()
</script>
