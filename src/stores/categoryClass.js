import { defineStore } from 'pinia'
import { ref } from 'vue'

// User's own necessity/luxury classification per category name. Independent of
// the backend's NEED/WANT kind (which only seeds the default). Stored locally.
const KEY = 'restje.categoryClass'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export const useCategoryClassStore = defineStore('categoryClass', () => {
  const map = ref(load()) // { [categoryName]: 'luxury' | 'necessity' }

  function set(name, value) {
    map.value[name] = value
    localStorage.setItem(KEY, JSON.stringify(map.value))
  }

  // Resolve with a fallback (usually derived from the category's kind).
  function classOf(name, fallback) {
    return map.value[name] || fallback
  }

  function toggle(name, fallback) {
    set(name, classOf(name, fallback) === 'luxury' ? 'necessity' : 'luxury')
  }

  return { map, set, classOf, toggle }
})
