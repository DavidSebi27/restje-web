const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Format an ISO date (yyyy-mm-dd) as "Today" / "Yesterday" / "10 Jun" / "10 Jun 2025".
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return iso

  const now = new Date()
  const ty = now.getFullYear()
  if (y === ty && m === now.getMonth() + 1 && d === now.getDate()) return 'Today'

  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)
  if (y === yest.getFullYear() && m === yest.getMonth() + 1 && d === yest.getDate())
    return 'Yesterday'

  const base = `${d} ${MONTHS[m - 1]}`
  return y === ty ? base : `${base} ${y}`
}
