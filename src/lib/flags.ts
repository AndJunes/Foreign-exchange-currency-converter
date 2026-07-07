// Country codes for which a flag asset exists under
// /public/assets/images/flags/<code>.webp (60 provided by the design).
const AVAILABLE_FLAGS = new Set([
  'ae', 'ar', 'au', 'bd', 'bg', 'bh', 'br', 'ca', 'ch', 'cl', 'cn', 'co',
  'cy', 'cz', 'dk', 'eg', 'eu', 'gb', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu',
  'id', 'in', 'is', 'jo', 'jp', 'ke', 'kr', 'kw', 'lb', 'lc', 'lk', 'ma',
  'mx', 'my', 'ng', 'no', 'np', 'nz', 'om', 'pe', 'ph', 'pk', 'pl', 'qa',
  'ro', 'ru', 'sa', 'se', 'sg', 'th', 'tr', 'tw', 'ua', 'us', 'vn', 'za',
])

// A few currencies whose ISO prefix doesn't match their flag file.
const FLAG_OVERRIDES: Record<string, string> = {
  // ILS (Israel) has no flag asset in the design set -> handled by fallback.
}

/** Map an ISO-4217 currency code to its flag file basename (country code).
 *  The convention is the first two letters lowercased (USD -> us, EUR -> eu). */
export function flagCode(currency: string): string | null {
  const override = FLAG_OVERRIDES[currency]
  if (override) return AVAILABLE_FLAGS.has(override) ? override : null
  const code = currency.slice(0, 2).toLowerCase()
  return AVAILABLE_FLAGS.has(code) ? code : null
}

export function flagUrl(currency: string): string | null {
  const code = flagCode(currency)
  return code ? `/assets/images/flags/${code}.webp` : null
}
