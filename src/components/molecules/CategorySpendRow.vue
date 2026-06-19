<script setup>
import { ref, computed, watch } from 'vue'
import { listTransactions, setTransactionClassification } from '@/api/transactions'
import Money from '@/components/atoms/Money.vue'

const props = defineProps({
  name: { type: String, required: true },
  glyph: { type: String, default: '' },
  spent: { type: [Number, String], default: 0 },
  categoryId: { type: String, default: null },
  classification: { type: String, default: 'necessity' }, // category-level
})
const emit = defineEmits(['toggle-class', 'contribution'])

const expanded = ref(false)
const txns = ref([])
const loaded = ref(false)
const loading = ref(false)
const overrides = ref({}) // txnId -> 'luxury' | 'necessity'

function txnName(t) {
  const n = t.counterparty
  if (n && !/^not\s*provided$/i.test(n.trim())) return n
  return t.transactionType || '—'
}

// A payment's effective class: its override, else its stored value, else the
// category's class.
function effClass(t) {
  return (
    overrides.value[t.id] ||
    (t.classification ? String(t.classification).toLowerCase() : props.classification)
  )
}

// What this category contributes to "could free up": once expanded, sum the
// luxury debits exactly; before that, the whole spend if the category is luxury.
const contribution = computed(() => {
  if (loaded.value && txns.value.length) {
    return txns.value
      .filter((t) => Number(t.amount) < 0 && effClass(t) === 'luxury')
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
  }
  return props.classification === 'luxury' ? Math.abs(Number(props.spent)) : 0
})
watch(contribution, (v) => emit('contribution', v), { immediate: true })

async function toggleExpand() {
  expanded.value = !expanded.value
  if (expanded.value && !loaded.value && props.categoryId) {
    loading.value = true
    try {
      const { data } = await listTransactions({ category: props.categoryId, size: 200 })
      txns.value = data.content ?? data
      loaded.value = true
    } finally {
      loading.value = false
    }
  }
}

function toggleTxn(t) {
  const next = effClass(t) === 'luxury' ? 'necessity' : 'luxury'
  overrides.value = { ...overrides.value, [t.id]: next }
  setTransactionClassification(t.id, next.toUpperCase()).catch(() => {})
}
</script>

<template>
  <div class="row">
    <div class="top">
      <button
        type="button"
        class="summary"
        :disabled="!categoryId"
        @click="toggleExpand"
      >
        <span class="chev" :class="{ open: expanded, hidden: !categoryId }">▸</span>
        <span class="name">{{ glyph }} {{ name }}</span>
        <Money class="amt" :amount="spent" />
      </button>
      <button
        type="button"
        class="tag"
        :class="classification"
        @click="$emit('toggle-class')"
      >
        {{ classification }}
      </button>
    </div>

    <div v-if="expanded" class="txns">
      <p v-if="loading" class="loading">Loading…</p>
      <div v-for="t in txns" :key="t.id" class="txn">
        <span class="tmeta">
          <span class="tname">{{ txnName(t) }}</span>
          <span class="date">{{ t.bookingDate }}</span>
        </span>
        <Money class="tamt" :amount="t.amount" colour />
        <button
          type="button"
          class="tag small"
          :class="effClass(t)"
          @click="toggleTxn(t)"
        >
          {{ effClass(t) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  border-bottom: 1px solid var(--c-border);
}
.top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.amt {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
.tag {
  flex-shrink: 0;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 2px var(--space-3);
  font-size: var(--text-xs);
  cursor: pointer;
  text-transform: lowercase;
  background: transparent;
  color: var(--c-text-muted);
  min-width: 5.5rem;
}
.tag.small {
  min-width: 4.5rem;
  padding: 1px var(--space-2);
}
.tag.luxury {
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
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
}
.tmeta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
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
.tamt {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
</style>
