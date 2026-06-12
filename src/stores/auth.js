import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import { login as loginRequest, register as registerRequest } from '@/api/auth'

const TOKEN_KEY = 'restje.token'
const USER_KEY = 'restje.user'

export const useAuthStore = defineStore('auth', () => {
  // Token + user are persisted to localStorage so the session survives a
  // refresh / reopen of the installed PWA.
  //
  // Tradeoff (conscious choice): localStorage is readable by any script on the
  // origin, so an XSS bug would leak the JWT. The safer alternative is keeping
  // the token only in memory and forcing re-login on every refresh. For a
  // single-user personal PWA on your own device with your own data, the
  // persistence win outweighs the risk. Revisit if this ever goes multi-user.
  const token = ref(localStorage.getItem(TOKEN_KEY) || null)
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser ?? null

    if (newToken) localStorage.setItem(TOKEN_KEY, newToken)
    else localStorage.removeItem(TOKEN_KEY)

    if (newUser) localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    else localStorage.removeItem(USER_KEY)
  }

  async function login(credentials) {
    const { data } = await loginRequest(credentials)
    setSession(data.token, data.user)
  }

  async function register(payload) {
    const { data } = await registerRequest(payload)
    setSession(data.token, data.user)
  }

  function logout() {
    setSession(null, null)
    if (router.currentRoute.value.path !== '/login') router.push('/login')
  }

  return { token, user, isAuthenticated, login, register, logout }
})
