import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listCategories } from '@/api/categories'

export const useCategoriesStore = defineStore('categories', () => {
  const items = ref([])
  const loaded = ref(false)

  // Categories rarely change; load once and reuse.
  async function load() {
    if (loaded.value) return
    items.value = (await listCategories()).data
    loaded.value = true
  }

  // Force a refetch (e.g. after changing a classification).
  async function reload() {
    loaded.value = false
    return load()
  }

  return { items, loaded, load, reload }
})
