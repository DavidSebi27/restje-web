<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '@/stores/budget'
import { useDashboardStore } from '@/stores/dashboard'
import { useOnboardingStore } from '@/stores/onboarding'
import { confirmOnboarding } from '@/api/onboarding'

// First-run confirmation screen. The import seeds the budget store with derived
// suggestions (income, savings, recurring bills); the user confirms or edits,
// then we commit via /api/onboarding/confirm.
const budget = useBudgetStore()
const dashboard = useDashboardStore()
const onboarding = useOnboardingStore()
const router = useRouter()
const saving = ref(false)

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(
    Number(n) || 0,
  )
const incomeMissing = computed(() => !(Number(budget.monthlyIncome) > 0))

// Pull a detected one-off inflow into the monthly income figure.
function includeOneOff(inflow, index) {
  budget.monthlyIncome = (Number(budget.monthlyIncome) || 0) + Number(inflow.amount)
  onboarding.oneOffInflows.splice(index, 1)
}

onMounted(() => {
  // Only fetch if we arrived without seeded suggestions (e.g. direct nav).
  if (budget.monthlyIncome == null && !budget.recurring.length) budget.load()
})

function addRecurring() {
  budget.recurring.push({ name: '', amount: '0', dayOfMonth: 1, categoryId: null })
}

// Onboarding bills are in-memory suggestions (no id yet), so drop by index.
function removeBill(index) {
  budget.recurring.splice(index, 1)
}

async function confirm() {
  saving.value = true
  try {
    await confirmOnboarding({
      monthlyIncome: budget.monthlyIncome,
      savingsTarget: budget.savingsTarget,
      recurringExpenses: budget.recurring.map((r) => ({
        name: r.name,
        amount: r.amount,
        dayOfMonth: r.dayOfMonth,
        categoryId: r.categoryId ?? null,
      })),
    })
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

    <p v-if="incomeMissing" class="warn">
      Income is €0, so your daily number will be negative. Set your real monthly
      income above.
    </p>

    <div v-if="onboarding.incomeSources.length" class="detected">
      <span class="d-title">Detected income</span>
      <div v-for="s in onboarding.incomeSources" :key="s.label" class="d-row">
        <span class="d-label">{{ s.label }}</span>
        <span class="d-amt">{{ eur(s.monthlyMedian) }}/mo · {{ s.occurrences }}×</span>
      </div>
    </div>

    <div v-if="onboarding.oneOffInflows.length" class="detected">
      <span class="d-title">One-off money in — not counted as income</span>
      <div v-for="(o, i) in onboarding.oneOffInflows" :key="i" class="d-row">
        <span class="d-label">{{ o.label }}</span>
        <span class="d-right">
          <span class="d-amt">{{ eur(o.amount) }}</span>
          <button type="button" class="incl" @click="includeOneOff(o, i)">+ add</button>
        </span>
      </div>
    </div>

    <label>
      <span>Savings target / month</span>
      <input v-model="budget.savingsTarget" type="number" inputmode="decimal" />
    </label>

    <h2>Recurring bills</h2>
    <div v-for="(r, i) in budget.recurring" :key="i" class="recurring-row">
      <input v-model="r.name" placeholder="e.g. Rent" class="grow" />
      <input v-model="r.amount" type="number" inputmode="decimal" class="amt" />
      <button
        type="button"
        class="remove"
        aria-label="Remove bill"
        @click="removeBill(i)"
      >
        ×
      </button>
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
.warn {
  color: var(--c-bad);
  background: var(--c-bad-soft);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  margin: 0 0 var(--space-3);
}
.detected {
  background: var(--c-surface);
  border-radius: var(--radius);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
}
.d-title {
  display: block;
  color: var(--c-text-muted);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-2);
}
.d-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 2px 0;
}
.d-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.d-amt {
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
.d-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.incl {
  border: 1px solid var(--c-good);
  color: var(--c-good);
  background: transparent;
  border-radius: var(--radius-sm);
  padding: 1px var(--space-2);
  cursor: pointer;
  font-size: var(--text-xs);
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
.recurring-row .remove {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text-muted);
  cursor: pointer;
  padding: 0 var(--space-3);
  font-size: 1.1rem;
  line-height: 1;
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
