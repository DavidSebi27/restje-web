import { defineStore } from 'pinia'
import { ref } from 'vue'

// Friendly display names for recurring bills, keyed by the bill's id. Stored
// locally (the backend has no alias field yet), so these are per-device.
const KEY = 'restje.recurringAliases'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export const useAliasStore = defineStore('aliases', () => {
  const map = ref(load())

  function set(id, alias) {
    const value = (alias || '').trim()
    if (value) map.value[id] = value
    else delete map.value[id]
    localStorage.setItem(KEY, JSON.stringify(map.value))
  }

  // The alias if set, otherwise the original name.
  function label(id, fallback) {
    return map.value[id] || fallback
  }

  return { map, set, label }
})
