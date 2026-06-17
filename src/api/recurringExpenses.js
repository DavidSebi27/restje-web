import client from './client'

// Recurring expenses are their own resource (not part of the budget profile).
// Item: { id, name, amount, dayOfMonth, categoryId, categoryName, active }
// Request body: { name, amount (positive), dayOfMonth, categoryId, active }
export function listRecurring() {
  return client.get('/recurring-expenses')
}

export function createRecurring(payload) {
  return client.post('/recurring-expenses', payload)
}

export function updateRecurring(id, payload) {
  return client.put(`/recurring-expenses/${id}`, payload)
}

export function deleteRecurring(id) {
  return client.delete(`/recurring-expenses/${id}`)
}
