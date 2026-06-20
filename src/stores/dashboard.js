import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchDashboard } from '@/api/dashboard'

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const viewDate = ref(today()) // the date/month currently shown

  // Pass a date to switch (month navigation); omit to reload the current view
  // (so an action mid-review doesn't snap back to today).
  async function load(date) {
    if (date) viewDate.value = date
    loading.value = true
    error.value = null
    try {
      data.value = (await fetchDashboard(viewDate.value)).data
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

  return { data, loading, error, viewDate, isOver, load }
})
