<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <Transition name="toast">
    <div v-if="toast.visible" class="toast" role="status">
      <span class="msg">{{ toast.message }}</span>
      <button v-if="toast.action" class="act" @click="toast.runAction()">
        {{ toast.action.label }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom) + var(--space-12));
  transform: translateX(-50%);
  max-width: 90vw;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--c-surface-2);
  color: var(--c-text);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  font-size: var(--text-sm);
  box-shadow: var(--shadow-md);
  z-index: 100;
}
.msg {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.act {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--c-accent);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
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
