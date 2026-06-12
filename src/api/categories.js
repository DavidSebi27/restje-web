import client from './client'

// GET /api/categories -> [{ id, name, type }]  (type: NEED | WANT)
export function listCategories() {
  return client.get('/categories')
}
