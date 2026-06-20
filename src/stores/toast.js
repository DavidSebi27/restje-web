import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const visible = ref(false)
  const action = ref(null) // { label, fn }
  let timer

  // show(msg) or show(msg, { ms, action: { label, fn } })
  function show(msg, opts = {}) {
    message.value = msg
    action.value = opts.action || null
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
      action.value = null
    }, opts.ms || 2600)
  }

  function dismiss() {
    visible.value = false
    action.value = null
  }

  function runAction() {
    const a = action.value
    dismiss()
    if (a?.fn) a.fn()
  }

  return { message, visible, action, show, dismiss, runAction }
})
