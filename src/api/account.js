import client from './client'

// DELETE /api/account/data -> 204
// Wipes all of the caller's data (transactions, budget, recurring, known
// accounts, user rules) but keeps the account/login. Needs a backend endpoint.
export function resetAccountData() {
  return client.delete('/account/data')
}
