<template>
  <NuxtLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          Baby-Foot Tournament Manager
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Organize and manage your foosball tournaments with ease
        </p>
        <div v-if="!isAuthenticated" class="flex justify-center space-x-4">
          <NuxtLink to="/register" class="btn btn-primary text-lg px-8 py-3">
            Get Started
          </NuxtLink>
          <NuxtLink to="/login" class="btn btn-secondary text-lg px-8 py-3">
            Login
          </NuxtLink>
        </div>
        <div v-else class="flex justify-center space-x-4">
          <NuxtLink
            v-if="isAdmin"
            to="/tournaments/new"
            class="btn btn-primary text-lg px-8 py-3"
          >
            Create Tournament
          </NuxtLink>
          <NuxtLink
            v-else
            to="/join"
            class="btn btn-primary text-lg px-8 py-3"
          >
            Join a Tournament
          </NuxtLink>
          <NuxtLink to="/tournaments" class="btn btn-secondary text-lg px-8 py-3">
            View All Tournaments
          </NuxtLink>
        </div>
      </div>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="card text-center">
          <div class="text-4xl mb-4">🏆</div>
          <h3 class="text-xl font-semibold mb-2">Create Tournaments</h3>
          <p class="text-gray-600">
            Set up tournaments with custom names, dates, and descriptions
          </p>
        </div>

        <div class="card text-center">
          <div class="text-4xl mb-4">👥</div>
          <h3 class="text-xl font-semibold mb-2">Manage Teams</h3>
          <p class="text-gray-600">
            Add teams and players to compete in your tournaments
          </p>
        </div>

        <div class="card text-center">
          <div class="text-4xl mb-4">⚡</div>
          <h3 class="text-xl font-semibold mb-2">Auto-Generate Matches</h3>
          <p class="text-gray-600">
            Automatic round-robin scheduling where every team plays each other
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { isAuthenticated, isAdmin } = useAuth()
</script>
