<script setup>
import { computed } from 'vue'
import { categoryGlyph } from '@/utils/categoryEmoji'
import CategoryBar from '@/components/molecules/CategoryBar.vue'

const props = defineProps({
  // Dashboard byCategory: [{ categoryName, emoji, total }]
  categories: { type: Array, default: () => [] },
})

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
      <h2 class="section-title">Where it went</h2>
      <span class="total">{{ totalLabel }} spent</span>
    </div>

    <CategoryBar
      v-for="r in rows"
      :key="r.key"
      :label="r.label"
      :amount="r.value"
      :total="total"
    />
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
</style>
