<script setup>
import { onMounted, ref } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useDashboardStore } from '@/stores/dashboard'
import KnownAccountsManager from '@/components/organisms/KnownAccountsManager.vue'

const budget = useBudgetStore()
const dashboard = useDashboardStore()
const saving = ref(false)
const saved = ref(false)
const newRow = ref({ name: '', amount: '' })

onMounted(() => budget.load())

async function onSave() {
  saving.value = true
  saved.value = false
  try {
    await budget.save()
    await dashboard.load() // budget changes move the daily number
    saved.value = true
  } finally {
    saving.value = false
  }
}

function rowPayload(r) {
  return {
    name: r.name,
    amount: r.amount,
    dayOfMonth: r.dayOfMonth || 1,
    categoryId: r.categoryId ?? null,
    active: r.active ?? true,
  }
}

async function onSaveRow(r) {
  await budget.saveRecurring(r.id, rowPayload(r))
  await dashboard.load()
}

async function onAddRow() {
  if (!newRow.value.name || !newRow.value.amount) return
  await budget.addRecurring({
    name: newRow.value.name,
    amount: newRow.value.amount,
    dayOfMonth: 1,
    categoryId: null,
    active: true,
  })
  newRow.value = { name: '', amount: '' }
  await dashboard.load()
}

async function onRemoveRow(r) {
  await budget.removeRecurring(r.id)
  await dashboard.load()
}
</script>

<template>
  <main class="settings">
    <h1>Settings</h1>

    <section class="budget">
      <h2>Budget</h2>
      <label>
        <span>Monthly income</span>
        <input v-model="budget.monthlyIncome" type="number" inputmode="decimal" />
      </label>
      <label>
        <span>Savings target / month</span>
        <input v-model="budget.savingsTarget" type="number" inputmode="decimal" />
      </label>

      <button type="button" class="save" :disabled="saving" @click="onSave">
        {{ saving ? 'Saving…' : 'Save budget' }}
      </button>
      <p v-if="saved" class="ok">Saved.</p>

      <h3>Recurring expenses</h3>
      <div v-for="r in budget.recurring" :key="r.id" class="recurring-row">
        <input v-model="r.name" placeholder="e.g. Rent" class="grow" />
        <input v-model="r.amount" type="number" inputmode="decimal" class="amt" />
        <button type="button" class="rsave" @click="onSaveRow(r)">Save</button>
        <button type="button" class="remove" @click="onRemoveRow(r)">×</button>
      </div>

      <div class="recurring-row">
        <input v-model="newRow.name" placeholder="New bill…" class="grow" />
        <input v-model="newRow.amount" type="number" inputmode="decimal" class="amt" />
        <button type="button" class="add" @click="onAddRow">Add</button>
      </div>
    </section>

    <section class="accounts">
      <h2>Known accounts</h2>
      <KnownAccountsManager />
    </section>
  </main>
</template>

<style scoped>
.settings {
  padding: var(--space-4) var(--space-4) var(--space-8);
}
h1 {
  font-size: 1.4rem;
}
h2 {
  font-size: 1.1rem;
  margin-top: var(--space-6);
}
h3 {
  font-size: 1rem;
  margin-top: var(--space-6);
}
section.budget label {
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
  align-items: center;
}
.recurring-row .grow {
  flex: 1;
  min-width: 0;
}
.recurring-row .amt {
  width: 5.5rem;
}
.rsave,
.add {
  border: 1px solid var(--c-accent);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-accent);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
}
.remove {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  cursor: pointer;
  padding: 0 var(--space-3);
}
.save {
  display: block;
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.save:disabled {
  opacity: 0.6;
}
.ok {
  color: var(--c-good);
  font-size: 0.85rem;
}
</style>
