import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { listKnownAccounts } from '@/api/knownAccounts'

export const useKnownAccountsStore = defineStore('knownAccounts', () => {
  const accounts = ref([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      accounts.value = (await listKnownAccounts()).data
    } finally {
      loading.value = false
    }
  }

  const own = computed(() => accounts.value.filter((a) => a.scope === 'OWN'))

  // A party is "unclassified" until it has a real treatment — either null or an
  // explicit UNCLASSIFIED value (auto-created from an import, awaiting triage).
  const isUnset = (a) => !a.treatment || a.treatment === 'UNCLASSIFIED'

  const parties = computed(() =>
    accounts.value.filter((a) => a.scope === 'KNOWN_PARTY' && !isUnset(a)),
  )
  const unclassified = computed(() =>
    accounts.value.filter((a) => a.scope === 'KNOWN_PARTY' && isUnset(a)),
  )

  return { accounts, loading, own, parties, unclassified, load }
})
