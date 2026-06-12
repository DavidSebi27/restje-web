import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBudget, putBudget } from '@/api/budget'

export const useBudgetStore = defineStore('budget', () => {
  const monthlyIncome = ref(null)
  const savingsTarget = ref(null)
  const recurring = ref([])
  const loading = ref(false)
  const loaded = ref(false)

  async function load() {
    loading.value = true
    try {
      const { data } = await getBudget()
      monthlyIncome.value = data.monthlyIncome
      savingsTarget.value = data.savingsTarget
      recurring.value = data.recurring ?? []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function save() {
    await putBudget({
      monthlyIncome: monthlyIncome.value,
      savingsTarget: savingsTarget.value,
      recurring: recurring.value,
    })
    loaded.value = true
  }

  return { monthlyIncome, savingsTarget, recurring, loading, loaded, load, save }
})
