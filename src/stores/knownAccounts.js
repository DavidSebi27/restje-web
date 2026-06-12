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

  // Classified parties have a treatment; the rest land in the triage bucket.
  const parties = computed(() =>
    accounts.value.filter((a) => a.scope === 'KNOWN_PARTY' && a.treatment),
  )
  const unclassified = computed(() =>
    accounts.value.filter((a) => a.scope === 'KNOWN_PARTY' && !a.treatment),
  )

  return { accounts, loading, own, parties, unclassified, load }
})
