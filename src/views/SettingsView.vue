<script setup>
import { onMounted, ref } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useDashboardStore } from '@/stores/dashboard'
import { resetAccountData } from '@/api/account'
import KnownAccountsManager from '@/components/organisms/KnownAccountsManager.vue'

const budget = useBudgetStore()
const dashboard = useDashboardStore()
const saving = ref(false)
const saved = ref(false)
const newRow = ref({ name: '', amount: '' })

const confirming = ref(false)
const resetting = ref(false)
const resetError = ref(null)

async function onReset() {
  resetting.value = true
  resetError.value = null
  try {
    await resetAccountData()
    // Hard reload guarantees clean store state; the token survives in localStorage,
    // so we stay logged in and land on the cold-start dashboard.
    window.location.assign('/')
  } catch (e) {
    resetError.value =
      e.response?.status === 404
        ? 'Reset isn’t available yet — backend needs DELETE /api/account/data.'
        : 'Couldn’t reset your data. Try again.'
    resetting.value = false
  }
}

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

    <section class="danger">
      <h2>Danger zone</h2>
      <p class="hint">
        Wipes all your transactions, budget, recurring bills and known accounts.
        Your login stays. This can’t be undone.
      </p>

      <button
        v-if="!confirming"
        type="button"
        class="danger-btn"
        @click="confirming = true"
      >
        Reset all data
      </button>

      <div v-else class="confirm-row">
        <span class="ask">Sure? This can’t be undone.</span>
        <div class="confirm-actions">
          <button
            type="button"
            class="ghost"
            :disabled="resetting"
            @click="confirming = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="danger-btn"
            :disabled="resetting"
            @click="onReset"
          >
            {{ resetting ? 'Resetting…' : 'Yes, delete everything' }}
          </button>
        </div>
      </div>

      <p v-if="resetError" class="err">{{ resetError }}</p>
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

.danger {
  margin-top: var(--space-8);
  padding: var(--space-4);
  border: 1px solid var(--c-bad);
  border-radius: var(--radius);
  background: var(--c-bad-soft);
}
.danger h2 {
  margin-top: 0;
  color: var(--c-bad);
}
.danger .hint {
  font-size: 0.85rem;
  color: var(--c-text-muted);
  margin: 0 0 var(--space-3);
}
.danger-btn {
  border: none;
  border-radius: var(--radius-sm);
  background: var(--c-bad);
  color: #fff;
  font-weight: 600;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
}
.danger-btn:disabled {
  opacity: 0.6;
}
.confirm-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.confirm-row .ask {
  font-size: 0.9rem;
  font-weight: 600;
}
.confirm-actions {
  display: flex;
  gap: var(--space-2);
}
.confirm-actions .ghost {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  cursor: pointer;
  padding: var(--space-3) var(--space-4);
}
.err {
  color: var(--c-bad);
  font-size: 0.85rem;
  margin: var(--space-2) 0 0;
}
</style>
