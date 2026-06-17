import client from './client'

// POST /api/onboarding/confirm
// body: { monthlyIncome, savingsTarget, recurringExpenses: [{ name, amount,
//         dayOfMonth, categoryId }] } -> BudgetDto
// Commits the (possibly edited) first-import suggestions and configures the budget.
export function confirmOnboarding(payload) {
  return client.post('/onboarding/confirm', payload)
}
