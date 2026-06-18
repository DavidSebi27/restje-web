// The backend stores short ASCII tokens in Category.emoji (e.g. 'cart', 'bag')
// and leaves the glyph mapping to the frontend (see V2__seed_global_categories.sql).
const GLYPHS = {
  cart: '🛒',
  bowl: '🍜',
  coffee: '☕',
  bento: '🍱',
  bag: '🛍️',
  game: '🎮',
  plane: '✈️',
  train: '🚆',
  lotion: '🧴',
  bank: '🏦',
  question: '❓',
  house: '🏠',
  hospital: '🏥',
  phone: '📱',
  globe: '🌐',
  money: '💶',
  school: '🎓',
  piggy: '🐷',
  cycle: '🔁',
}

// Returns the glyph for a token, or '' if unknown (so callers can omit it).
export function categoryGlyph(token) {
  return GLYPHS[token] || ''
}
