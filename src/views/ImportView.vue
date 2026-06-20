<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { importCsv } from '@/api/transactions'
import { useDashboardStore } from '@/stores/dashboard'
import { useBudgetStore } from '@/stores/budget'
import { useKnownAccountsStore } from '@/stores/knownAccounts'
import { useOnboardingStore } from '@/stores/onboarding'
import ImportDropzone from '@/components/organisms/ImportDropzone.vue'

const dashboard = useDashboardStore()
const budget = useBudgetStore()
const knownAccounts = useKnownAccountsStore()
const onboarding = useOnboardingStore()
const router = useRouter()

const result = ref(null)
const busy = ref(false)
const error = ref(null)

async function onFile(file) {
  busy.value = true
  error.value = null
  const form = new FormData()
  form.append('file', file)
  try {
    const summary = (await importCsv(form)).data
    result.value = summary
    // Cold start: the import returns derived suggestions -> confirm them.
    if (summary.derivation) {
      const d = summary.derivation
      budget.monthlyIncome = d.suggestedMonthlyIncome
      budget.savingsTarget = d.suggestedSavingsTarget
      budget.recurring = (d.recurringExpenses || []).map((r) => ({
        name: r.name,
        amount: r.amount,
        dayOfMonth: r.dayOfMonth,
        categoryId: null,
      }))
      onboarding.setDerivation(d) // detected income sources / one-offs for the screen
      router.push('/onboarding')
      return
    }
    await dashboard.load() // refresh the number
    await knownAccounts.load() // surface any new unclassified parties
  } catch {
    error.value = 'Import failed. Make sure it’s an ING CSV export.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="import">
    <h1>Import</h1>
    <p class="lead">
      Export a month from the ING app or site, then drop the file here.
    </p>

    <ImportDropzone :busy="busy" @file="onFile" />

    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="result" class="result">
      {{ result.imported }} imported,
      {{ result.duplicatesSkipped }} duplicates skipped,
      {{ result.newlyCategorized }} freshly categorised.
    </p>
  </main>
</template>

<style scoped>
.import {
  padding: var(--space-4) var(--space-4) var(--space-8);
}
h1 {
  font-size: 1.4rem;
  margin-bottom: var(--space-1);
}
.lead {
  color: var(--c-text-muted);
  margin-bottom: var(--space-6);
}
.result {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius);
}
.error {
  color: var(--c-bad);
  margin-top: var(--space-4);
}
</style>
