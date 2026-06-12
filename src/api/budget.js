import client from './client'

// GET /api/budget -> { monthlyIncome, savingsTarget, recurring: [...] }
//   recurring item: { id, label, amount, dayOfMonth }
// The figures are derived from the first import; the user confirms/edits them
// during onboarding, then this PUT persists the budget.
export function getBudget() {
  return client.get('/budget')
}

export function putBudget(payload) {
  return client.put('/budget', payload)
}
