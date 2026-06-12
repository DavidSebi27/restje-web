import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchDashboard } from '@/api/dashboard'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function load(date = today()) {
    loading.value = true
    error.value = null
    try {
      data.value = (await fetchDashboard(date)).data
    } catch (e) {
      // 409 = not configured yet (cold start) -> caller routes to onboarding/import
      error.value = e.response?.status === 409 ? 'NEEDS_IMPORT' : 'GENERIC'
    } finally {
      loading.value = false
    }
  }

  const isOver = computed(
    () => data.value && Number(data.value.todayRemaining) < 0,
  )

  return { data, loading, error, isOver, load }
})
