<template>
  <NuxtLayout>
    <div class="relative overflow-hidden">
      <!-- Hero Section with Gradient Background -->
      <div class="relative bg-primary-50 py-20 sm:py-32">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div class="text-center">
            <div class="flex justify-center mb-8">
              <div class="w-24 h-24 bg-primary-500 rounded-box flex items-center justify-center shadow-strong">
                <span class="text-6xl">⚽</span>
              </div>
            </div>
            <h1 class="text-6xl md:text-7xl font-bold mb-6 text-gray-900">
              Baby-Foot Tournament
            </h1>
            <p class="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto font-medium">
              Organize and manage your foosball tournaments with ease. Track scores, generate matches, and celebrate winners.
            </p>
            <div v-if="!isAuthenticated" class="flex flex-col sm:flex-row justify-center gap-4">
              <NuxtLink
                to="/register"
                class="px-10 py-4 rounded-box text-lg font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-strong transition-all"
              >
                Get Started Free
              </NuxtLink>
              <NuxtLink
                to="/login"
                class="px-10 py-4 rounded-box text-lg font-bold bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-medium transition-all"
              >
                Login
              </NuxtLink>
            </div>
            <div v-else class="flex flex-col sm:flex-row justify-center gap-4">
              <NuxtLink
                v-if="isAdmin"
                to="/tournaments/new"
                class="px-10 py-4 rounded-box text-lg font-bold bg-secondary-500 text-white hover:bg-secondary-600 shadow-strong transition-all"
              >
                Create Tournament
              </NuxtLink>
              <NuxtLink
                v-else
                to="/join"
                class="px-10 py-4 rounded-box text-lg font-bold bg-primary-500 text-white hover:bg-primary-600 shadow-strong transition-all"
              >
                Join a Tournament
              </NuxtLink>
              <NuxtLink
                to="/tournaments"
                class="px-10 py-4 rounded-box text-lg font-bold bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-medium transition-all"
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
          <h2 class="text-4xl font-bold mb-4 text-gray-900">
            Everything You Need
          </h2>
          <p class="text-xl text-gray-600">Powerful features to manage your tournaments</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-box p-8 shadow-soft hover:shadow-medium transition-all border border-gray-200">
            <div class="w-16 h-16 bg-primary-500 rounded-box flex items-center justify-center mb-6 shadow-medium">
              <span class="text-4xl">🏆</span>
            </div>
            <h3 class="text-2xl font-bold mb-3 text-gray-900">Create Tournaments</h3>
            <p class="text-gray-600 leading-relaxed">
              Set up tournaments with custom names, dates, and descriptions. Simple and intuitive interface.
            </p>
          </div>

          <div class="bg-white rounded-box p-8 shadow-soft hover:shadow-medium transition-all border border-gray-200">
            <div class="w-16 h-16 bg-secondary-500 rounded-box flex items-center justify-center mb-6 shadow-medium">
              <span class="text-4xl">👥</span>
            </div>
            <h3 class="text-2xl font-bold mb-3 text-gray-900">Manage Teams</h3>
            <p class="text-gray-600 leading-relaxed">
              Add teams and players to compete in your tournaments. Track performance and statistics.
            </p>
          </div>

          <div class="bg-white rounded-box p-8 shadow-soft hover:shadow-medium transition-all border border-gray-200">
            <div class="w-16 h-16 bg-gray-700 rounded-box flex items-center justify-center mb-6 shadow-medium">
              <span class="text-4xl">⚡</span>
            </div>
            <h3 class="text-2xl font-bold mb-3 text-gray-900">Auto-Generate Matches</h3>
            <p class="text-gray-600 leading-relaxed">
              Automatic round-robin scheduling where every team plays each other. Fair and balanced.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-primary-600 py-16 mb-0">
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
            class="inline-block px-10 py-4 rounded-box text-lg font-bold bg-white text-primary-700 hover:bg-gray-100 shadow-strong transition-all"
          >
            Create Free Account
          </NuxtLink>
          <NuxtLink
            v-else
            :to="isAdmin ? '/tournaments/new' : '/join'"
            class="inline-block px-10 py-4 rounded-box text-lg font-bold bg-white text-primary-700 hover:bg-gray-100 shadow-strong transition-all"
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
