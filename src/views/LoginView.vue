<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const mode = ref('login') // 'login' | 'register'
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref(null)

const isRegister = () => mode.value === 'register'

function toggleMode() {
  mode.value = isRegister() ? 'login' : 'register'
  error.value = null
}

async function onSubmit() {
  busy.value = true
  error.value = null
  try {
    const credentials = { email: email.value, password: password.value }
    if (isRegister()) await auth.register(credentials)
    else await auth.login(credentials)
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value =
      e.response?.data?.message ||
      (e.response?.status === 401
        ? 'Wrong email or password.'
        : 'Something went wrong. Try again.')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="login">
    <div class="card">
      <h1 class="brand">Restje</h1>
      <p class="brand-jp">残り — のこり</p>
      <p class="tagline">What you have left to spend today.</p>

      <form @submit.prevent="onSubmit">
        <label>
          <span>Email</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :disabled="busy"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            :autocomplete="isRegister() ? 'new-password' : 'current-password'"
            required
            :disabled="busy"
          />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" :disabled="busy">
          {{ busy ? 'Please wait…' : isRegister() ? 'Create account' : 'Log in' }}
        </button>
      </form>

      <button type="button" class="switch" @click="toggleMode">
        {{ isRegister() ? 'Already have an account? Log in' : 'New here? Create an account' }}
      </button>
    </div>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}
.card {
  width: 100%;
  max-width: 360px;
}
.brand {
  text-align: center;
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--c-text);
}
.brand-jp {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--c-accent);
  letter-spacing: 0.1em;
  margin: var(--space-1) 0 0;
}
.tagline {
  text-align: center;
  color: var(--c-text-muted);
  margin: var(--space-2) 0 var(--space-8);
}
form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
label {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: 0.85rem;
  color: var(--c-text-muted);
}
input {
  padding: var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
}
input:focus {
  outline: 2px solid var(--c-accent);
  outline-offset: 1px;
}
button[type='submit'] {
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
button[type='submit']:disabled {
  opacity: 0.6;
  cursor: default;
}
.switch {
  display: block;
  width: 100%;
  margin-top: var(--space-4);
  background: none;
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
  text-decoration: underline;
}
.error {
  color: var(--c-bad);
  font-size: 0.85rem;
  margin: 0;
}
</style>
