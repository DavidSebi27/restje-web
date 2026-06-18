<script setup>
import { ref, computed } from 'vue'
import { updateKnownAccount } from '@/api/knownAccounts'

const props = defineProps({ account: { type: Object, required: true } })
const emit = defineEmits(['changed'])

const TREATMENTS = ['TRANSFER', 'SAVING', 'INCOME', 'EXPENSE']
const saving = ref(false)

// Auto-created parties arrive without a real treatment, awaiting triage.
const isUnset = computed(
  () => !props.account.treatment || props.account.treatment === 'UNCLASSIFIED',
)

function maskIban(iban) {
  return iban.length > 8 ? iban.slice(0, 4) + 'XXXX' + iban.slice(-4) : iban
}

async function onTreatment(e) {
  saving.value = true
  try {
    // PUT replaces the whole account; send all fields with the new treatment.
    await updateKnownAccount(props.account.id, {
      iban: props.account.iban,
      label: props.account.label,
      scope: props.account.scope,
      treatment: e.target.value,
      categoryId: props.account.categoryId ?? null,
    })
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
  color: var(--c-text);
}
select.unset {
  border-color: var(--c-accent);
  color: var(--c-accent);
}
</style>
