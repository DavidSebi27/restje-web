import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listTransactions, patchTransaction } from '@/api/transactions'

export const useTransactionsStore = defineStore('transactions', () => {
  const items = ref([])
  const loading = ref(false)

  async function load(params) {
    loading.value = true
    try {
      items.value = (await listTransactions(params)).data
    } finally {
      loading.value = false
    }
  }

  // Reclassify feeds the backend's USER_OVERRIDE rule. Patch the local copy in
  // place so the row updates immediately.
  async function reclassify(id, categoryId) {
    const { data } = await patchTransaction(id, { categoryId })
    const tx = items.value.find((t) => t.id === id)
    if (tx) Object.assign(tx, data)
    return data
  }

  return { items, loading, load, reclassify }
})
