<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <Transition name="toast">
    <div v-if="toast.visible" class="toast" role="status">{{ toast.message }}</div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom) + var(--space-12));
  transform: translateX(-50%);
  max-width: 90vw;
  padding: var(--space-3) var(--space-4);
  background: var(--c-text);
  color: #fff;
  border-radius: 999px;
  font-size: var(--text-sm);
  box-shadow: var(--shadow-md);
  z-index: 100;
  white-space: nowrap;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
