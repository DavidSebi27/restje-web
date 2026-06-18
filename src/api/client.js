import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:8080/api
})

// Attach the JWT on every request. useAuthStore() is called lazily inside the
// interceptor (not at module load) so this stays free of import-cycle issues.
client.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

// A 401 on an authenticated request means the token expired -> drop the session
// and bounce to login with a clear message. A 401 without a token is just a
// failed login attempt; let the caller (LoginView) handle that. Requests that
// pass `skipAuthLogout` (optional/self-handled calls, e.g. an endpoint that may
// not exist yet) opt out of the auto-logout.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.skipAuthLogout) {
      const auth = useAuthStore()
      if (auth.token) {
        useToastStore().show('Your session expired — please log in again.')
        auth.logout()
      }
    }
    return Promise.reject(err)
  },
)

export default client
