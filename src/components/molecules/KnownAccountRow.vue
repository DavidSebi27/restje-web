<script setup>
import { ref } from 'vue'
import { updateKnownAccount } from '@/api/knownAccounts'

const props = defineProps({ account: { type: Object, required: true } })
const emit = defineEmits(['changed'])

const TREATMENTS = ['TRANSFER', 'SAVING', 'INCOME', 'EXPENSE']
const saving = ref(false)

function maskIban(iban) {
  return iban.length > 8 ? iban.slice(0, 4) + 'XXXX' + iban.slice(-4) : iban
}

async function onTreatment(e) {
  saving.value = true
  try {
    await updateKnownAccount(props.account.id, { treatment: e.target.value })
    emit('changed') // parent reloads dashboard so the number reflects the change
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="row">
    <div class="meta">
      <span class="label">{{ account.label }}</span>
      <span class="iban">{{ maskIban(account.iban) }}</span>
    </div>
    <select
      :value="account.treatment || 'TRANSFER'"
      :disabled="saving"
      @change="onTreatment"
    >
      <option v-for="t in TREATMENTS" :key="t" :value="t">
        {{ t.toLowerCase() }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--c-border);
}
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.label {
  font-weight: 600;
}
.iban {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
select {
  padding: var(--space-2);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
}
</style>
