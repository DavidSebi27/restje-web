<script setup>
import { ref, computed } from 'vue'
import { updateKnownAccount } from '@/api/knownAccounts'
import { listTransactions } from '@/api/transactions'
import Money from '@/components/atoms/Money.vue'

const props = defineProps({ account: { type: Object, required: true } })
const emit = defineEmits(['changed'])

const TREATMENTS = ['TRANSFER', 'SAVING', 'INCOME', 'EXPENSE']
const saving = ref(false)

const expanded = ref(false)
const txns = ref([])
const loadedTxns = ref(false)
const loadingTxns = ref(false)

const isUnset = computed(
  () => !props.account.treatment || props.account.treatment === 'UNCLASSIFIED',
)
// Totals come from the backend now; only show/expand when it provides them.
const count = computed(() => props.account.count ?? null)
const hasTotal = computed(() => count.value != null)

function maskIban(iban) {
  return iban.length > 8 ? iban.slice(0, 4) + 'XXXX' + iban.slice(-4) : iban
}

function txnName(t) {
  const name = t.counterparty
  if (name && !/^not\s*provided$/i.test(name.trim())) return name
  return t.transactionType || '—'
}

async function toggleExpand() {
  expanded.value = !expanded.value
  if (expanded.value && !loadedTxns.value) {
    loadingTxns.value = true
    try {
      const { data } = await listTransactions({ iban: props.account.iban, size: 200 })
      txns.value = data.content ?? data
      loadedTxns.value = true
    } finally {
      loadingTxns.value = false
    }
  }
}

async function onTreatment(e) {
  saving.value = true
  try {
    await updateKnownAccount(props.account.id, {
      iban: props.account.iban,
      label: props.account.label,
      scope: props.account.scope,
      treatment: e.target.value,
      categoryId: props.account.categoryId ?? null,
    })
    emit('changed')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="account">
    <div class="top">
      <button
        type="button"
        class="summary"
        :disabled="!hasTotal"
        @click="toggleExpand"
      >
        <span class="chev" :class="{ open: expanded, hidden: !hasTotal }">▸</span>
        <span class="meta">
          <span class="label">{{ account.label }}</span>
          <span class="iban">
            {{ maskIban(account.iban) }}
            <template v-if="hasTotal"> · {{ count }}</template>
          </span>
        </span>
        <Money v-if="hasTotal" class="total" :amount="account.total" colour />
      </button>
      <select
        :value="isUnset ? '' : account.treatment"
        :class="{ unset: isUnset }"
        :disabled="saving"
        @change="onTreatment"
      >
        <option v-if="isUnset" value="" disabled>choose…</option>
        <option v-for="t in TREATMENTS" :key="t" :value="t">
          {{ t.toLowerCase() }}
        </option>
      </select>
    </div>

    <div v-if="expanded" class="txns">
      <p v-if="loadingTxns" class="loading">Loading…</p>
      <div v-for="t in txns" :key="t.id" class="txn">
        <span class="tmeta">
          <span class="tname">{{ txnName(t) }}</span>
          <span class="date">{{ t.bookingDate }}</span>
        </span>
        <Money :amount="t.amount" colour />
      </div>
    </div>
  </div>
</template>

<style scoped>
.account {
  border-bottom: 1px solid var(--c-border);
}
.top {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) 0;
}
.summary {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  padding: 0;
}
.summary:disabled {
  cursor: default;
}
.chev {
  flex-shrink: 0;
  color: var(--c-text-muted);
  transition: transform 0.15s;
}
.chev.open {
  transform: rotate(90deg);
}
.chev.hidden {
  visibility: hidden;
}
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.label {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.iban {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
.total {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
select {
  flex-shrink: 0;
  padding: var(--space-2);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
}
select.unset {
  border-color: var(--c-accent);
  color: var(--c-accent);
}
.txns {
  padding: 0 0 var(--space-3) calc(1em + var(--space-2));
}
.loading {
  color: var(--c-text-muted);
  font-size: var(--text-sm);
}
.txn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
}
.tmeta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tname {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.txn .date {
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
  font-size: var(--text-xs);
}
</style>
