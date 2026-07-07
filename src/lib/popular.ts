import type { Currency } from '../types'

/** Major currencies surfaced first in the picker. */
export const POPULAR_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY']

export function splitPopular(currencies: Currency[]): {
  popular: Currency[]
  other: Currency[]
} {
  const byCode = new Map(currencies.map((c) => [c.code, c]))
  const popular = POPULAR_CODES.map((code) => byCode.get(code)).filter(
    (c): c is Currency => Boolean(c),
  )
  const popularSet = new Set(popular.map((c) => c.code))
  const other = currencies.filter((c) => !popularSet.has(c.code))
  return { popular, other }
}
