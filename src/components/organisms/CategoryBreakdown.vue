<script setup>
import { computed } from 'vue'
import CategoryBar from '@/components/molecules/CategoryBar.vue'
import Money from '@/components/atoms/Money.vue'

const props = defineProps({
  // [{ categoryId, name, type, spent }]
  categories: { type: Array, default: () => [] },
})

function sumByType(type) {
  return props.categories
    .filter((c) => c.type === type)
    .reduce((sum, c) => sum + Number(c.spent), 0)
}

const total = computed(() =>
  props.categories.reduce((sum, c) => sum + Number(c.spent), 0),
)
const needTotal = computed(() => sumByType('NEED'))
const wantTotal = computed(() => sumByType('WANT'))
const needPct = computed(() =>
  total.value > 0 ? (needTotal.value / total.value) * 100 : 0,
)

const sorted = computed(() =>
  [...props.categories].sort((a, b) => Number(b.spent) - Number(a.spent)),
)
</script>

<template>
  <section v-if="categories.length" class="breakdown">
    <h2 class="section-title">Where it went</h2>

    <div class="split">
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
      v-for="c in sorted"
      :key="c.categoryId || c.name"
      :label="c.name"
      :amount="c.spent"
      :total="total"
      :type="c.type"
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
  background: #2c6b4f;
}
.seg.want {
  background: #b9803f;
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
  background: #2c6b4f;
}
.dot.want {
  background: #b9803f;
}
</style>
