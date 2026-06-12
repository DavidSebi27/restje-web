<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '@/stores/budget'
import { useDashboardStore } from '@/stores/dashboard'

// First-run confirmation screen. The first import derives suggested income +
// recurring bills (backend); the budget store is seeded with them and the user
// confirms or edits before we persist. Known accounts are seeded separately and
// edited later in Settings.
const budget = useBudgetStore()
const dashboard = useDashboardStore()
const router = useRouter()
const saving = ref(false)

onMounted(() => {
  // If we arrived here without seeded suggestions, fetch whatever exists.
  if (!budget.loaded) budget.load()
})

function addRecurring() {
  budget.recurring.push({ label: '', amount: '0', dayOfMonth: 1 })
}

async function confirm() {
  saving.value = true
  try {
    await budget.save()
    await dashboard.load()
    router.push('/')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="onboarding">
    <h1>Does this look right?</h1>
    <p class="lead">
      We worked these out from your import. Tweak anything, then confirm.
    </p>

    <label>
      <span>Monthly income</span>
      <input v-model="budget.monthlyIncome" type="number" inputmode="decimal" />
    </label>
    <label>
      <span>Savings target / month</span>
      <input v-model="budget.savingsTarget" type="number" inputmode="decimal" />
    </label>

    <h2>Recurring bills</h2>
    <div v-for="(r, i) in budget.recurring" :key="i" class="recurring-row">
      <input v-model="r.label" placeholder="e.g. Rent" class="grow" />
      <input v-model="r.amount" type="number" inputmode="decimal" class="amt" />
    </div>
    <button type="button" class="add" @click="addRecurring">+ Add a bill</button>

    <button type="button" class="confirm" :disabled="saving" @click="confirm">
      {{ saving ? 'Saving…' : 'Looks good — show my number' }}
    </button>
  </main>
</template>

<style scoped>
.onboarding {
  padding: var(--space-6) var(--space-4) var(--space-8);
}
h1 {
  font-size: 1.4rem;
  margin-bottom: var(--space-1);
}
.lead {
  color: var(--c-text-muted);
  margin-bottom: var(--space-6);
}
h2 {
  font-size: 1.1rem;
  margin-top: var(--space-6);
}
label {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: 0.85rem;
  color: var(--c-text-muted);
  margin-bottom: var(--space-3);
}
input {
  padding: var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
}
.recurring-row {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.recurring-row .grow {
  flex: 1;
}
.recurring-row .amt {
  width: 6rem;
}
.add {
  background: none;
  border: none;
  color: var(--c-accent);
  cursor: pointer;
  padding: var(--space-2) 0;
}
.confirm {
  display: block;
  width: 100%;
  margin-top: var(--space-6);
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.confirm:disabled {
  opacity: 0.6;
}
</style>
