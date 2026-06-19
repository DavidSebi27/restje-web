<script setup>
import { ref } from 'vue'
import { listTransactions } from '@/api/transactions'
import Money from '@/components/atoms/Money.vue'

const props = defineProps({
  name: { type: String, required: true },
  glyph: { type: String, default: '' },
  spent: { type: [Number, String], default: 0 },
  categoryId: { type: String, default: null },
  classification: { type: String, default: 'necessity' }, // 'luxury' | 'necessity'
})
defineEmits(['toggle-class'])

const expanded = ref(false)
const txns = ref([])
const loaded = ref(false)
const loading = ref(false)

function txnName(t) {
  const n = t.counterparty
  if (n && !/^not\s*provided$/i.test(n.trim())) return n
  return t.transactionType || '—'
}

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
        <Money :amount="t.amount" colour />
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
