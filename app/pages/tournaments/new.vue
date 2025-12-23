<template>
  <NuxtLayout>
    <div class="max-w-2xl mx-auto px-4 py-12">
      <div class="card">
        <h1 class="text-3xl font-bold mb-8">Create Tournament</h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Tournament Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Summer Championship 2025"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="input"
              placeholder="Annual summer tournament for all skill levels..."
            ></textarea>
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              id="date"
              v-model="form.date"
              type="datetime-local"
              required
              class="input"
            />
          </div>

          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="loading"
              class="btn btn-primary flex-1"
            >
              <span v-if="loading">Creating...</span>
              <span v-else>Create Tournament</span>
            </button>
            <NuxtLink to="/tournaments" class="btn btn-secondary flex-1 text-center">
              Cancel
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { isAdmin } = useAuth()
const router = useRouter()

// Get current date and time in local timezone formatted for datetime-local input
const getCurrentDateTime = () => {
  const now = new Date()
  // Format: YYYY-MM-DDTHH:mm
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Redirect if not admin
onMounted(() => {
  if (!isAdmin.value) {
    router.push('/tournaments')
  }
})

const form = reactive({
  name: '',
  description: '',
  date: getCurrentDateTime()
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/tournaments', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description || undefined,
        date: new Date(form.date).toISOString()
      }
    })

    if (response.success) {
      router.push(`/tournaments/${response.tournament.id}`)
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to create tournament'
  } finally {
    loading.value = false
  }
}
</script>
