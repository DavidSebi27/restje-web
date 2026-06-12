<script setup>
import { computed } from 'vue'

// Formats a BigDecimal-as-string (or number) as a euro amount. The backend
// sends money as strings to avoid float drift, so Number() happens here at the
// very edge, for display only.
const props = defineProps({
  amount: { type: [String, Number], required: true },
  // When true, colour the value green/red by sign.
  colour: { type: Boolean, default: false },
  currency: { type: String, default: 'EUR' },
  locale: { type: String, default: 'nl-NL' },
})

const value = computed(() => Number(props.amount))

const formatted = computed(() =>
  new Intl.NumberFormat(props.locale, {
    style: 'currency',
    currency: props.currency,
  }).format(value.value),
)

const sign = computed(() =>
  value.value > 0 ? 'pos' : value.value < 0 ? 'neg' : 'zero',
)
</script>

<template>
  <span class="money" :class="colour ? sign : null">{{ formatted }}</span>
</template>

<style scoped>
.money.pos {
  color: var(--c-good);
}
.money.neg {
  color: var(--c-bad);
}
</style>
