<script setup>
import { ref } from 'vue'

defineProps({ busy: { type: Boolean, default: false } })
const emit = defineEmits(['file'])

const dragging = ref(false)
const input = ref(null)

function pick(file) {
  if (file) emit('file', file)
}
function onChange(e) {
  pick(e.target.files?.[0])
  e.target.value = '' // allow re-selecting the same file
}
function onDrop(e) {
  dragging.value = false
  pick(e.dataTransfer.files?.[0])
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ dragging, busy }"
    role="button"
    tabindex="0"
    @click="!busy && input.click()"
    @keydown.enter.prevent="!busy && input.click()"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="input"
      type="file"
      accept=".csv"
      hidden
      :disabled="busy"
      @change="onChange"
    />
    <p v-if="busy">Categorising…</p>
    <p v-else>Drop your ING CSV here, or tap to choose a file</p>
  </div>
</template>

<style scoped>
.dropzone {
  border: 2px dashed var(--c-border);
  border-radius: var(--radius);
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--c-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.dropzone.dragging {
  border-color: var(--c-accent);
  background: var(--c-surface);
}
.dropzone.busy {
  cursor: default;
  opacity: 0.7;
}
</style>
