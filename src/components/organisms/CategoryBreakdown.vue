<script setup>
import { computed, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import CategoryBar from '@/components/molecules/CategoryBar.vue'
import Money from '@/components/atoms/Money.vue'

const props = defineProps({
  // Dashboard byCategory: [{ categoryName, emoji, total }]
  categories: { type: Array, default: () => [] },
})

// Spend has no NEED/WANT on the dashboard payload; join to the category list by
// name to recover each kind for the needs-vs-wants split.
const catStore = useCategoriesStore()
onMounted(() => catStore.load())

const kindByName = computed(() => {
  const map = {}
  for (const c of catStore.items) map[c.name] = c.kind
  return map
})

function amount(row) {
  return Math.abs(Number(row.total))
}

const rows = computed(() =>
  [...props.categories]
    .map((r) => ({
      key: r.categoryName,
      label: r.emoji ? `${r.emoji} ${r.categoryName}` : r.categoryName,
      value: amount(r),
      kind: kindByName.value[r.categoryName] || null,
    }))
    .sort((a, b) => b.value - a.value),
)

const total = computed(() => rows.value.reduce((s, r) => s + r.value, 0))
const needTotal = computed(() =>
  rows.value.filter((r) => r.kind === 'NEED').reduce((s, r) => s + r.value, 0),
)
const wantTotal = computed(() =>
  rows.value.filter((r) => r.kind === 'WANT').reduce((s, r) => s + r.value, 0),
)
const splitTotal = computed(() => needTotal.value + wantTotal.value)
const needPct = computed(() =>
  splitTotal.value > 0 ? (needTotal.value / splitTotal.value) * 100 : 0,
)
</script>

<template>
  <section v-if="categories.length" class="breakdown">
    <h2 class="section-title">Where it went</h2>

    <div v-if="splitTotal > 0" class="split">
      <div class="split-bar">
        <div class="seg need" :style="{ width: needPct + '%' }"></div>
        <div class="seg want" :style="{ width: 100 - needPct + '%' }"></div>
      </div>
      <div class="split-legend">
        <span><i class="dot need"></i> Needs <Money :amount="needTotal" /></span>
        <span><i class="dot want"></i> Wants <Money :amount="wantTotal" /></span>
      </div>
    </div>

    <CategoryBar
      v-for="r in rows"
      :key="r.key"
      :label="r.label"
      :amount="r.value"
      :total="total"
      :type="r.kind"
    />
  </section>
</template>

<style scoped>
.breakdown {
  padding: 0 var(--space-4) var(--space-6);
}
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-text-muted);
  margin: 0 0 var(--space-3);
}
.split {
  margin-bottom: var(--space-6);
}
.split-bar {
  display: flex;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--c-surface);
}
.seg.need {
  background: var(--c-need);
}
.seg.want {
  background: var(--c-want);
}
.split-legend {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: 0.85rem;
  color: var(--c-text-muted);
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-right: var(--space-1);
}
.dot.need {
  background: var(--c-need);
}
.dot.want {
  background: var(--c-want);
}
</style>
