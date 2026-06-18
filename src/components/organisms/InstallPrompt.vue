<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Captures the browser's beforeinstallprompt so we can offer an in-app
// "Add to Home Screen" button instead of relying on the browser's own UI.
// (Service-worker updates are handled automatically by registerType:autoUpdate.)
const deferred = ref(null)
const visible = ref(false)

function onBeforeInstall(e) {
  e.preventDefault()
  deferred.value = e
  visible.value = true
}

onMounted(() => window.addEventListener('beforeinstallprompt', onBeforeInstall))
onUnmounted(() =>
  window.removeEventListener('beforeinstallprompt', onBeforeInstall),
)

async function install() {
  if (!deferred.value) return
  deferred.value.prompt()
  await deferred.value.userChoice
  deferred.value = null
  visible.value = false
}

function dismiss() {
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="install">
    <span class="text">Install Restje for a one-tap home-screen app</span>
    <div class="actions">
      <button class="ghost" @click="dismiss">Not now</button>
      <button class="primary" @click="install">Install</button>
    </div>
  </div>
</template>

<style scoped>
.install {
  position: fixed;
  left: var(--space-4);
  right: var(--space-4);
  bottom: calc(var(--space-8) + var(--space-4));
  max-width: 448px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--c-surface-2);
  color: var(--c-text);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  z-index: 50;
}
.text {
  font-size: 0.85rem;
}
.actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}
button {
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  font-size: 0.85rem;
}
.ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
}
.primary {
  background: var(--c-accent);
  color: #fff;
  font-weight: 600;
}
</style>
