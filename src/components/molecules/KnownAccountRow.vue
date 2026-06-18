<script setup>
import { ref, computed } from 'vue'
import { updateKnownAccount } from '@/api/knownAccounts'
import Money from '@/components/atoms/Money.vue'

const props = defineProps({
  account: { type: Object, required: true },
  transactions: { type: Array, default: () => [] },
})
const emit = defineEmits(['changed'])

const TREATMENTS = ['TRANSFER', 'SAVING', 'INCOME', 'EXPENSE']
const saving = ref(false)
const expanded = ref(false)

// Auto-created parties arrive without a real treatment, awaiting triage.
const isUnset = computed(
  () => !props.account.treatment || props.account.treatment === 'UNCLASSIFIED',
)
const hasTxns = computed(() => props.transactions.length > 0)
const total = computed(() =>
  props.transactions.reduce((s, t) => s + Number(t.amount), 0),
)

function maskIban(iban) {
  return iban.length > 8 ? iban.slice(0, 4) + 'XXXX' + iban.slice(-4) : iban
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
        :disabled="!hasTxns"
        @click="expanded = !expanded"
      >
        <span class="chev" :class="{ open: expanded, hidden: !hasTxns }">▸</span>
        <span class="meta">
          <span class="label">{{ account.label }}</span>
          <span class="iban">
            {{ maskIban(account.iban) }}
            <template v-if="hasTxns"> · {{ transactions.length }}</template>
          </span>
        </span>
        <Money v-if="hasTxns" class="total" :amount="total" colour />
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
      <div v-for="t in transactions" :key="t.id" class="txn">
        <span class="date">{{ t.bookingDate }}</span>
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
.txn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
}
.txn .date {
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
