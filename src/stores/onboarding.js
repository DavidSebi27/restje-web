import { defineStore } from 'pinia'
import { ref } from 'vue'

// Transient first-import detection detail (income sources, one-off inflows) so
// onboarding can show where the suggested income came from. Not persisted.
export const useOnboardingStore = defineStore('onboarding', () => {
  const incomeSources = ref([]) // [{ label, monthlyMedian, occurrences }]
  const oneOffInflows = ref([]) // [{ label, amount, date }]

  function setDerivation(d) {
    incomeSources.value = d?.incomeSources || []
    oneOffInflows.value = d?.oneOffInflows || []
  }

  return { incomeSources, oneOffInflows, setDerivation }
})
