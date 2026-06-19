import client from './client'

// POST /api/transactions/import (multipart form, field "file")
// -> { imported, duplicatesSkipped, newlyCategorized, firstImport,
//      unclassifiedParties }
// axios sets the multipart boundary automatically from the FormData.
export function importCsv(formData) {
  return client.post('/transactions/import', formData)
}

// GET /api/transactions?... -> [{ id, date, counterparty, description,
//   amount, categoryId, categoryName, categoryType }]
export function listTransactions(params) {
  return client.get('/transactions', { params })
}

// PATCH /api/transactions/{id} { categoryId }
// The backend upserts a USER_OVERRIDE merchant rule, so the correction sticks
// for every future import of that merchant.
export function patchTransaction(id, patch) {
  return client.patch(`/transactions/${id}`, patch)
}

export function deleteTransaction(id) {
  return client.delete(`/transactions/${id}`)
}

// PUT /api/transactions/{id}/classification { classification }
// Per-transaction necessity/luxury override (null inherits the category's).
// Optional/self-handled: opts out of the global 401 auto-logout.
export function setTransactionClassification(id, classification) {
  return client.put(
    `/transactions/${id}/classification`,
    { classification },
    { skipAuthLogout: true },
  )
}
