<script setup>
import { ref, computed } from 'vue'
import Money from '@/components/atoms/Money.vue'
import CategoryPill from '@/components/atoms/CategoryPill.vue'

const props = defineProps({
  transaction: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['reclassify'])

const picking = ref(false)

const merchant = computed(
  () =>
    props.transaction.counterparty ||
    props.transaction.description ||
    'Unknown',
)

function choose(e) {
  const categoryId = e.target.value
  picking.value = false
  if (categoryId && categoryId !== String(props.transaction.categoryId)) {
    emit('reclassify', { id: props.transaction.id, categoryId })
  }
}
</script>

<template>
  <div class="tx">
    <div class="main">
      <div class="meta">
        <span class="merchant">{{ merchant }}</span>
        <span class="date">{{ transaction.date }}</span>
      </div>
      <div class="right">
        <Money class="amount" :amount="transaction.amount" colour />
        <button class="cat" type="button" @click="picking = !picking">
          <CategoryPill
            :label="transaction.categoryName || 'Uncategorised'"
            :type="transaction.categoryType"
          />
        </button>
      </div>
    </div>

    <div v-if="picking" class="picker">
      <select :value="transaction.categoryId" @change="choose">
        <option v-for="c in categories" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
      <p class="explain">
        Always categorise <strong>{{ merchant }}</strong> as the category you
        pick — for every future import.
      </p>
    </div>
  </div>
</template>

<style scoped>
.tx {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--c-border);
}
.main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.merchant {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.date {
  font-size: 0.8rem;
  color: var(--c-text-muted);
}
.right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.amount {
  font-variant-numeric: tabular-nums;
}
.cat {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.picker {
  margin-top: var(--space-2);
}
.picker select {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
}
.explain {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  margin: var(--space-1) 0 0;
}
</style>
