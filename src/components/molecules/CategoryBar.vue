<script setup>
import { computed } from 'vue'
import Money from '@/components/atoms/Money.vue'

const props = defineProps({
  label: { type: String, required: true },
  amount: { type: [String, Number], required: true },
  total: { type: [String, Number], default: 0 },
  type: { type: String, default: null }, // NEED | WANT
})

const pct = computed(() => {
  const total = Number(props.total)
  if (total <= 0) return 0
  return Math.min(100, (Number(props.amount) / total) * 100)
})
</script>

<template>
  <div class="bar-row">
    <div class="head">
      <span class="label">{{ label }}</span>
      <Money :amount="amount" />
    </div>
    <div class="track">
      <div
        class="fill"
        :class="type ? type.toLowerCase() : null"
        :style="{ width: pct + '%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.bar-row {
  margin-bottom: var(--space-3);
}
.head {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: var(--space-1);
}
.track {
  height: 8px;
  border-radius: 999px;
  background: var(--c-surface);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  background: var(--c-accent);
  opacity: 0.55;
}
.fill.need {
  background: var(--c-good);
}
.fill.want {
  background: var(--c-accent);
}
</style>
