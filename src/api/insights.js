import client from './client'

// GET /api/insights/category-trends
// -> [{ categoryId, categoryName, emoji, kind, thisMonth, monthlyAverage, months }]
// Per-category spend this month vs the user's own monthly average, so savings
// tips can be "above your usual" instead of a flat percentage.
export function getCategoryTrends() {
  return client.get('/insights/category-trends')
}
