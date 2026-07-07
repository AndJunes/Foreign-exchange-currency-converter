import type { Currency, CurrencyCode, HistoryPoint, Market, RangeKey, RateMap } from '../types'

const BASE = 'https://api.frankfurter.dev/v1'

// ---- tiny GET-JSON cache (per session) ----
const cache = new Map<string, { at: number; data: unknown }>()

/** Cache lifetime per endpoint family, in one place so callers stay consistent. */
const TTL = {
  currencies: 3_600_000, // the currency list virtually never changes
  market: 60_000, // latest rates: refresh often
  history: 300_000, // historical ranges are immutable once published
} as const

async function getJson<T>(url: string, ttlMs: number): Promise<T> {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`)
  const data = (await res.json()) as T
  cache.set(url, { at: Date.now(), data })
  return data
}

// ---- date helpers ----
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return isoDate(d)
}

const RANGE_LOOKBACK: Record<RangeKey, number> = {
  '1d': 5,
  '1w': 7,
  '1m': 31,
  '3m': 92,
  '1y': 366,
  '5y': 366 * 5,
}

// ---- endpoints ----

/** All currencies with live ECB rates (≈30). */
export async function fetchCurrencies(): Promise<Currency[]> {
  const data = await getJson<Record<string, string>>(`${BASE}/currencies`, TTL.currencies)
  return Object.entries(data)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

interface RangeResponse {
  base: string
  rates: Record<string, RateMap>
}

/** Latest rates plus the prior business day, to derive a 24h change. */
export async function fetchMarket(base: CurrencyCode = 'USD'): Promise<Market> {
  const url = `${BASE}/${daysAgo(10)}..${isoDate(new Date())}?base=${base}`
  const data = await getJson<RangeResponse>(url, TTL.market)
  const dates = Object.keys(data.rates).sort()
  if (dates.length === 0) throw new Error('No market data available')
  const lastDate = dates[dates.length - 1]
  const prevDate = dates[dates.length - 2] ?? lastDate
  const withBase = (m: RateMap): RateMap => ({ ...m, [base]: 1 })
  return {
    base,
    date: lastDate,
    latest: withBase(data.rates[lastDate]),
    previous: withBase(data.rates[prevDate]),
  }
}

/** Rate history for a single pair over a range. */
export async function fetchTimeseries(
  from: CurrencyCode,
  to: CurrencyCode,
  range: RangeKey,
): Promise<HistoryPoint[]> {
  if (from === to) return []
  const start = daysAgo(RANGE_LOOKBACK[range])
  const end = isoDate(new Date())
  const url = `${BASE}/${start}..${end}?base=${from}&symbols=${to}`
  const data = await getJson<RangeResponse>(url, TTL.history)
  const points = Object.entries(data.rates)
    .map(([date, m]) => ({ date, value: m[to] }))
    .filter((p) => Number.isFinite(p.value))
    .sort((a, b) => a.date.localeCompare(b.date))
  return downsample(points, 180)
}

/** Keep charts light: cap the number of rendered points, evenly sampled,
 *  always preserving the first and last. */
function downsample(points: HistoryPoint[], max: number): HistoryPoint[] {
  if (points.length <= max) return points
  const step = (points.length - 1) / (max - 1)
  const out: HistoryPoint[] = []
  for (let i = 0; i < max; i++) out.push(points[Math.round(i * step)])
  return out
}
