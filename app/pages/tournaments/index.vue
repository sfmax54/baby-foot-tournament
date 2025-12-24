<template>
  <NuxtLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">Tournaments</h1>
        <NuxtLink
          v-if="isAdmin"
          to="/tournaments/new"
          class="btn btn-primary"
        >
          + Create Tournament
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-600">Loading tournaments...</div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <div v-else-if="tournaments.length === 0" class="text-center py-12">
        <div class="text-gray-600 mb-4">No tournaments found</div>
        <NuxtLink
          v-if="isAdmin"
          to="/tournaments/new"
          class="btn btn-primary"
        >
          Create your first tournament
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="tournament in sortedTournaments"
          :key="tournament.id"
          :class="[
            'card hover:shadow-xl transition-all cursor-pointer',
            tournament.status === 'COMPLETED' ? 'opacity-75 bg-gray-50 border-2 border-gray-300' : ''
          ]"
          @click="$router.push(`/tournaments/${tournament.id}`)"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-2">
              <h3 class="text-xl font-semibold">{{ tournament.name }}</h3>
              <span v-if="tournament.status === 'COMPLETED'" class="text-xl">🏆</span>
            </div>
            <span
              :class="getStatusClass(tournament.status)"
              class="px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap"
            >
              {{ getStatusLabel(tournament.status) }}
            </span>
          </div>

          <p v-if="tournament.description" class="text-gray-600 mb-4 line-clamp-2">
            {{ tournament.description }}
          </p>

          <div class="flex items-center text-sm text-gray-500 space-x-4">
            <div class="flex items-center">
              <span class="mr-1">📅</span>
              {{ formatDate(tournament.date) }}
            </div>
            <div class="flex items-center">
              <span class="mr-1">👥</span>
              {{ tournament._count?.teams || 0 }} teams
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="text-xs text-gray-500">
              Created by {{ tournament.createdBy?.username }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { isAdmin } = useAuth()

const tournaments = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// Sort tournaments: active (UPCOMING, IN_PROGRESS) first, then COMPLETED
const sortedTournaments = computed(() => {
  return [...tournaments.value].sort((a, b) => {
    const statusOrder = {
      IN_PROGRESS: 1,
      UPCOMING: 2,
      COMPLETED: 3,
      CANCELLED: 4
    }
    const orderA = statusOrder[a.status as keyof typeof statusOrder] || 99
    const orderB = statusOrder[b.status as keyof typeof statusOrder] || 99

    if (orderA !== orderB) {
      return orderA - orderB
    }

    // If same status, sort by date (most recent first)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

const getStatusClass = (status: string) => {
  const classes = {
    UPCOMING: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    UPCOMING: 'UPCOMING',
    IN_PROGRESS: 'IN PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  }
  return labels[status as keyof typeof labels] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchTournaments = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/tournaments')
    tournaments.value = data.tournaments
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load tournaments'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTournaments()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
