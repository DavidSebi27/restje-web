import client from './client'

// Known accounts tell the app which IBANs are yours and how to treat each
// counterparty. Each: { id, label, iban, scope, treatment }
//   scope:     OWN | KNOWN_PARTY
//   treatment: TRANSFER | SAVING | INCOME | EXPENSE  (null = unclassified)

export function listKnownAccounts() {
  return client.get('/known-accounts')
}

export function createKnownAccount(payload) {
  return client.post('/known-accounts', payload)
}

export function updateKnownAccount(id, patch) {
  return client.patch(`/known-accounts/${id}`, patch)
}

export function deleteKnownAccount(id) {
  return client.delete(`/known-accounts/${id}`)
}
