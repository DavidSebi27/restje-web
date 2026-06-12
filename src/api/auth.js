import client from './client'

// POST /api/auth/login  -> { token, user }
export function login(credentials) {
  return client.post('/auth/login', credentials)
}

// POST /api/auth/register -> { token, user }
export function register(payload) {
  return client.post('/auth/register', payload)
}
