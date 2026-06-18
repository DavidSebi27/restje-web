<script setup>
import { computed } from 'vue'
import { categoryGlyph } from '@/utils/categoryEmoji'
import CategoryBar from '@/components/molecules/CategoryBar.vue'

const props = defineProps({
  // Dashboard byCategory: [{ categoryName, emoji, total }]
  categories: { type: Array, default: () => [] },
  selectedKey: { type: String, default: null },
})
defineEmits(['select'])

function amount(row) {
  return Math.abs(Number(row.total))
}

const rows = computed(() =>
  [...props.categories]
    .map((r) => {
      const glyph = categoryGlyph(r.emoji)
      return {
        key: r.categoryName,
        label: glyph ? `${glyph} ${r.categoryName}` : r.categoryName,
        value: amount(r),
      }
    })
    .sort((a, b) => b.value - a.value),
)

const total = computed(() => rows.value.reduce((s, r) => s + r.value, 0))
const totalLabel = computed(() =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(total.value),
)
</script>

<template>
  <section v-if="categories.length" class="breakdown">
    <div class="head">
      <h2 class="section-title">Where it went <span class="jp">内訳</span></h2>
      <span class="total">{{ totalLabel }} spent</span>
    </div>

    <button
      v-for="r in rows"
      :key="r.key"
      type="button"
      class="row-btn"
      :class="{ active: r.key === selectedKey }"
      @click="$emit('select', r)"
    >
      <CategoryBar :label="r.label" :amount="r.value" :total="total" />
    </button>
  </section>
</template>

<style scoped>
.breakdown {
  padding: 0 var(--space-4) var(--space-6);
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  margin: 0;
}
.total {
  font-size: var(--text-sm);
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
.row-btn {
  display: block;
  text-align: left;
  background: none;
  border: none;
  color: var(--c-text); /* buttons reset to system text colour otherwise */
  padding: var(--space-2);
  margin: 0 calc(-1 * var(--space-2));
  width: calc(100% + 2 * var(--space-2));
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.row-btn.active {
  background: var(--c-surface-2);
}
.row-btn :deep(.bar-row) {
  margin-bottom: 0;
}
.row-btn + .row-btn {
  margin-top: var(--space-2);
}
</style>
