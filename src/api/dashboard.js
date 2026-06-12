import client from './client'

// GET /api/dashboard?date=YYYY-MM-DD -> the money call.
// Shape: { date, todayRemaining, dailyAllowance, todaySpent,
//          monthRemaining, daysLeft, byCategory, recentTransactions }
// 409 means the user hasn't configured a budget / imported yet (cold start).
export function fetchDashboard(date) {
  return client.get('/dashboard', { params: { date } })
}
