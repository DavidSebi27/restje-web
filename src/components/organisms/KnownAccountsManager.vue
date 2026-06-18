<script setup>
import { onMounted, ref, computed } from 'vue'
import { useKnownAccountsStore } from '@/stores/knownAccounts'
import { useDashboardStore } from '@/stores/dashboard'
import { useCategoriesStore } from '@/stores/categories'
import { createKnownAccount } from '@/api/knownAccounts'
import { listTransactions } from '@/api/transactions'
import KnownAccountRow from '@/components/molecules/KnownAccountRow.vue'

const accounts = useKnownAccountsStore()
const dashboard = useDashboardStore()
const categories = useCategoriesStore()

// Transactions grouped by counterparty IBAN, so each account can show its
// payments/transfers and a net total. Loaded client-side (personal scale).
const txnsByIban = ref({})

// IBANs are stored normalised on known accounts but may keep CSV spacing/case on
// transactions — match on a normalised key so nothing slips through.
const normIban = (s) => (s || '').replace(/\s/g, '').toUpperCase()

async function loadTxns() {
  const map = {}
  const size = 500
  try {
    for (let page = 0; page < 40; page++) {
      const { data } = await listTransactions({ page, size })
      const rows = data.content ?? data
      for (const t of rows) {
        const key = normIban(t.counterpartyIban)
        if (!key) continue
        ;(map[key] ||= []).push(t)
      }
      const last = data.last ?? rows.length < size
      if (last || !rows.length) break
    }
  } catch {
    // leave whatever we managed to group
  }
  txnsByIban.value = map
}
const txnsFor = (iban) => txnsByIban.value[normIban(iban)] || []

const blank = () => ({
  label: '',
  iban: '',
  scope: 'OWN',
  treatment: 'TRANSFER',
  categoryId: '',
})
const form = ref(blank())
const adding = ref(false)
const addError = ref(null)

// EXPENSE/INCOME accounts must carry a category (backend validates this).
const needsCategory = computed(() =>
  ['EXPENSE', 'INCOME'].includes(form.value.treatment),
)

onMounted(() => {
  accounts.load()
  categories.load()
  loadTxns()
})

// A treatment change must visibly move the daily number — that cause-and-effect
// is what makes the setting feel real.
async function onChanged() {
  await accounts.load()
  await dashboard.load()
}

async function onAdd() {
  if (!form.value.label.trim() || !form.value.iban.trim()) {
    addError.value = 'Label and IBAN are both required.'
    return
  }
  if (needsCategory.value && !form.value.categoryId) {
    addError.value = 'Pick a category for income/expense accounts.'
    return
  }
  adding.value = true
  addError.value = null
  try {
    await createKnownAccount({
      iban: form.value.iban.trim(),
      label: form.value.label.trim(),
      scope: form.value.scope,
      treatment: form.value.treatment,
      categoryId: needsCategory.value ? form.value.categoryId : null,
    })
    form.value = blank()
    await onChanged()
  } catch (e) {
    addError.value =
      e.response?.status === 409
        ? 'That IBAN is already saved.'
        : 'Couldn’t add that account.'
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div class="manager">
    <section class="add">
      <h2>Add an account</h2>
      <div class="fields">
        <input v-model="form.label" placeholder="Label (e.g. My savings)" />
        <input v-model="form.iban" placeholder="IBAN" autocapitalize="characters" />
        <select v-model="form.scope">
          <option value="OWN">My account</option>
          <option value="KNOWN_PARTY">Person / party</option>
        </select>
        <select v-model="form.treatment">
          <option value="TRANSFER">transfer</option>
          <option value="SAVING">saving</option>
          <option value="INCOME">income</option>
          <option value="EXPENSE">expense</option>
        </select>
        <select v-if="needsCategory" v-model="form.categoryId">
          <option value="" disabled>Category…</option>
          <option v-for="c in categories.items" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>
      <p v-if="addError" class="err">{{ addError }}</p>
      <button type="button" class="add-btn" :disabled="adding" @click="onAdd">
        {{ adding ? 'Adding…' : 'Add account' }}
      </button>
    </section>

    <section>
      <h2>My accounts</h2>
      <p class="hint">
        IBANs that are yours. Money moving between them isn’t spending.
      </p>
      <KnownAccountRow
        v-for="a in accounts.own"
        :key="a.id"
        :account="a"
        :transactions="txnsFor(a.iban)"
        @changed="onChanged"
      />
      <p v-if="!accounts.own.length" class="empty">None yet.</p>
    </section>

    <section>
      <h2>People &amp; parties</h2>
      <p class="hint">People and companies you pay or get paid by.</p>
      <KnownAccountRow
        v-for="a in accounts.parties"
        :key="a.id"
        :account="a"
        :transactions="txnsFor(a.iban)"
        @changed="onChanged"
      />
      <p v-if="!accounts.parties.length" class="empty">None yet.</p>
    </section>

    <section v-if="accounts.unclassified.length">
      <h2>Unclassified parties</h2>
      <p class="hint">
        New counterparties from your last import. Triage them — they default to
        transfer until you decide.
      </p>
      <KnownAccountRow
        v-for="a in accounts.unclassified"
        :key="a.id"
        :account="a"
        :transactions="txnsFor(a.iban)"
        @changed="onChanged"
      />
    </section>

    <dl class="legend">
      <dt>transfer</dt>
      <dd>moving my own money around, don’t count it</dd>
      <dt>saving</dt>
      <dd>setting money aside, don’t count it as spent</dd>
      <dt>income</dt>
      <dd>money coming in</dd>
      <dt>expense</dt>
      <dd>a real cost I pay a person (e.g. rent), count it</dd>
    </dl>
  </div>
</template>

<style scoped>
.manager section {
  margin-bottom: var(--space-6);
}
h2 {
  font-size: 1rem;
  margin: 0 0 var(--space-1);
}
.hint {
  font-size: 0.85rem;
  color: var(--c-text-muted);
  margin: 0 0 var(--space-2);
}
.empty {
  color: var(--c-text-muted);
  font-size: 0.9rem;
}

.add {
  padding: var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius);
}
.fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.fields input,
.fields select {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
}
.add-btn {
  width: 100%;
  margin-top: var(--space-3);
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  color: var(--c-on-accent);
  font-weight: 600;
  cursor: pointer;
}
.add-btn:disabled {
  opacity: 0.6;
}
.err {
  color: var(--c-bad);
  font-size: 0.85rem;
  margin: var(--space-2) 0 0;
}

.legend {
  margin: var(--space-6) 0 0;
  padding: var(--space-4);
  background: var(--c-surface);
  border-radius: var(--radius);
  font-size: 0.85rem;
}
.legend dt {
  font-weight: 600;
  text-transform: capitalize;
}
.legend dd {
  margin: 0 0 var(--space-2);
  color: var(--c-text-muted);
}
</style>
