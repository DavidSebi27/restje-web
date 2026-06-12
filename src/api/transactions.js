import client from './client'

// POST /api/transactions/import (multipart form, field "file")
// -> { imported, duplicatesSkipped, newlyCategorized, firstImport,
//      unclassifiedParties }
// axios sets the multipart boundary automatically from the FormData.
export function importCsv(formData) {
  return client.post('/transactions/import', formData)
}
