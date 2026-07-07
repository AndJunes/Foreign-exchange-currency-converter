import type { CurrencyCode, Market, RateMap } from '../types'

/** Cross rate from → to, both expressed against the market's base.
 *  rate(from→to) = value_of_to / value_of_from. */
export function crossRate(rates: RateMap, from: CurrencyCode, to: CurrencyCode): number {
  const f = rates[from]
  const t = rates[to]
  // Explicit numeric checks: 0 is a legitimate rate value for `to`,
  // while a 0 divisor would produce Infinity rather than a real rate.
  if (!Number.isFinite(f) || !Number.isFinite(t) || f === 0) return NaN
  return t / f
}

export function convert(rates: RateMap, from: CurrencyCode, to: CurrencyCode, amount: number): number {
  return crossRate(rates, from, to) * amount
}

/** 24h (prior business day → latest) percentage change of the from→to rate. */
export function change24h(market: Market, from: CurrencyCode, to: CurrencyCode): number {
  const now = crossRate(market.latest, from, to)
  const prev = crossRate(market.previous, from, to)
  if (!Number.isFinite(now) || !Number.isFinite(prev) || prev === 0) return NaN
  return ((now - prev) / prev) * 100
}
