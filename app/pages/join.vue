<template>
  <NuxtLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-bold mb-8">Join a Tournament</h1>

      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-600">Loading available tournaments...</div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <div v-else-if="tournaments.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">No tournaments available for registration at the moment</p>
        <p class="text-sm text-gray-500">Check back later or contact an admin</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="tournament in tournaments"
          :key="tournament.id"
          class="card hover:shadow-xl transition-shadow"
        >
          <div class="mb-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-2xl font-semibold">{{ tournament.name }}</h3>
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                OPEN
              </span>
            </div>

            <p v-if="tournament.description" class="text-gray-600 mb-3">
              {{ tournament.description }}
            </p>

            <div class="flex items-center text-sm text-gray-500 space-x-4 mb-3">
              <div class="flex items-center">
                <span class="mr-1">📅</span>
                {{ formatDate(tournament.date) }}
              </div>
              <div class="flex items-center">
                <span class="mr-1">👥</span>
                {{ tournament._count?.teams || 0 }} teams registered
              </div>
            </div>

            <div class="text-xs text-gray-500">
              Organized by {{ tournament.createdBy?.username }}
            </div>
          </div>

          <!-- Show if user is already registered -->
          <div v-if="isUserInTournament(tournament)" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <div class="font-semibold mb-1">✓ You're registered!</div>
            <div class="text-sm">Team: {{ getUserTeamName(tournament) }}</div>
          </div>

          <!-- Show if matches already generated -->
          <div v-else-if="tournament._count?.matches > 0" class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
            <div class="font-semibold mb-1">⚠️ Registration Closed</div>
            <div class="text-sm">Matches have already been generated for this tournament.</div>
          </div>

          <!-- Registration button -->
          <button
            v-else
            @click="selectedTournament = tournament; showJoinModal = true"
            class="w-full btn btn-primary"
          >
            Join Tournament
          </button>

          <!-- Show registered teams -->
          <div v-if="tournament.teams && tournament.teams.length > 0" class="mt-4 pt-4 border-t border-gray-200">
            <div class="text-sm font-semibold text-gray-700 mb-2">Registered Teams:</div>
            <div class="space-y-2">
              <div
                v-for="team in tournament.teams"
                :key="team.id"
                class="text-sm bg-gray-50 rounded p-2"
              >
                <div class="font-medium">{{ team.name }}</div>
                <div class="text-xs text-gray-600">
                  <template v-if="team.members && team.members.length > 0">
                    {{ team.members.map(m => m.user.username).join(' & ') }}
                  </template>
                  <template v-else-if="team.player1Name && team.player2Name">
                    {{ team.player1Name }} & {{ team.player2Name }}
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Join Tournament Modal -->
      <div
        v-if="showJoinModal && selectedTournament"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showJoinModal = false"
      >
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-2xl font-bold mb-4">Join {{ selectedTournament.name }}</h3>

          <form @submit.prevent="joinTournament" class="space-y-4">
            <div v-if="joinError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {{ joinError }}
            </div>

            <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <div class="font-semibold mb-1">Team Registration</div>
              <div>You need a partner to join this tournament. Enter their email address below.</div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                v-model="joinForm.teamName"
                type="text"
                required
                class="input"
                placeholder="The Dream Team"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Partner's Email *
              </label>
              <input
                v-model="joinForm.partnerEmail"
                type="email"
                required
                class="input"
                placeholder="partner@example.com"
              />
              <p class="text-xs text-gray-500 mt-1">
                Your partner must have an account on the platform
              </p>
            </div>

            <div class="flex space-x-3">
              <button
                type="submit"
                :disabled="joining"
                class="btn btn-primary flex-1"
              >
                <span v-if="joining">Joining...</span>
                <span v-else>Join Tournament</span>
              </button>
              <button
                type="button"
                @click="showJoinModal = false"
                class="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { user, isAuthenticated } = useAuth()
const router = useRouter()

// Redirect if not authenticated
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
  }
})

const tournaments = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const showJoinModal = ref(false)
const selectedTournament = ref<any>(null)
const joinForm = reactive({
  teamName: '',
  partnerEmail: ''
})
const joining = ref(false)
const joinError = ref('')

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isUserInTournament = (tournament: any) => {
  if (!user.value || !tournament.teams) return false
  return tournament.teams.some((team: any) =>
    team.members && team.members.some((member: any) => member.userId === user.value.id)
  )
}

const getUserTeamName = (tournament: any) => {
  if (!user.value || !tournament.teams) return ''
  const team = tournament.teams.find((team: any) =>
    team.members && team.members.some((member: any) => member.userId === user.value.id)
  )
  return team?.name || ''
}

const fetchTournaments = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/tournaments/available')
    tournaments.value = data.tournaments
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load tournaments'
  } finally {
    loading.value = false
  }
}

const joinTournament = async () => {
  if (!selectedTournament.value) return

  joining.value = true
  joinError.value = ''

  try {
    await $fetch(`/api/tournaments/${selectedTournament.value.id}/join`, {
      method: 'POST',
      body: {
        teamName: joinForm.teamName,
        partnerEmail: joinForm.partnerEmail
      }
    })

    showJoinModal.value = false
    joinForm.teamName = ''
    joinForm.partnerEmail = ''

    // Refresh tournaments list
    await fetchTournaments()

    // Show success message
    alert('Successfully joined the tournament!')
  } catch (e: any) {
    joinError.value = e.data?.message || 'Failed to join tournament'
  } finally {
    joining.value = false
  }
}

onMounted(() => {
  fetchTournaments()
})
</script>
