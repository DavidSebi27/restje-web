import client from './client'

// GET /api/categories -> [{ id, name, emoji, kind, global, classification }]
// classification: NECESSITY | LUXURY (per-user; defaults from kind)
export function listCategories() {
  return client.get('/categories')
}

// PUT /api/categories/{id}/classification { classification }
// Optional/self-handled: opts out of the global 401 auto-logout.
export function setCategoryClassification(id, classification) {
  return client.put(
    `/categories/${id}/classification`,
    { classification },
    { skipAuthLogout: true },
  )
}
