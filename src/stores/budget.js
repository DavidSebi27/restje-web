import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBudget, putBudget } from '@/api/budget'
import {
  listRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
} from '@/api/recurringExpenses'

export const useBudgetStore = defineStore('budget', () => {
  const monthlyIncome = ref(null)
  const savingsTarget = ref(null) // serialised as monthlySavingsTarget
  const currency = ref('EUR')
  const recurring = ref([]) // RecurringExpenseDto[] (persisted) or suggestions (onboarding)
  const loading = ref(false)
  const loaded = ref(false)

  async function load() {
    loading.value = true
    try {
      try {
        const { data } = await getBudget()
        monthlyIncome.value = data.monthlyIncome
        savingsTarget.value = data.monthlySavingsTarget
        currency.value = data.currency || 'EUR'
      } catch (e) {
        // 404 until a budget is configured (cold start) — leave fields null.
        if (e.response?.status !== 404) throw e
      }
      try {
        recurring.value = (await listRecurring()).data
      } catch {
        recurring.value = []
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function save() {
    await putBudget({
      monthlyIncome: monthlyIncome.value,
      monthlySavingsTarget: savingsTarget.value,
      currency: currency.value || 'EUR',
    })
    loaded.value = true
  }

  // Recurring expenses are managed per-row against their own endpoint.
  async function addRecurring(item) {
    const { data } = await createRecurring(item)
    recurring.value.push(data)
    return data
  }
  async function saveRecurring(id, item) {
    const { data } = await updateRecurring(id, item)
    const i = recurring.value.findIndex((r) => r.id === id)
    if (i !== -1) recurring.value[i] = data
    return data
  }
  async function removeRecurring(id) {
    if (id) await deleteRecurring(id)
    recurring.value = recurring.value.filter((r) => r.id !== id)
  }

  return {
    monthlyIncome,
    savingsTarget,
    currency,
    recurring,
    loading,
    loaded,
    load,
    save,
    addRecurring,
    saveRecurring,
    removeRecurring,
  }
})
