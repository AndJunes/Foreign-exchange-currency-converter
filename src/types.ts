export type CurrencyCode = string

export interface Currency {
  code: CurrencyCode
  name: string
}

export type RateMap = Record<CurrencyCode, number>

/** Snapshot of the market for a base currency: latest rates + the prior
 *  business day, used to derive a 24h change for every pair. */
export interface Market {
  base: CurrencyCode
  date: string // ISO date of the latest rates
  latest: RateMap
  previous: RateMap
}

export interface HistoryPoint {
  date: string // YYYY-MM-DD
  value: number
}

export type RangeKey = '1d' | '1w' | '1m' | '3m' | '1y' | '5y'

/** A favourited/pinned currency pair. */
export interface FavoritePair {
  from: CurrencyCode
  to: CurrencyCode
}

export interface LogEntry {
  id: string
  from: CurrencyCode
  to: CurrencyCode
  amount: number
  result: number
  rate: number
  at: number // epoch ms
}

export type TabKey = 'history' | 'compare' | 'favorites' | 'log'
export type Theme = 'dark' | 'light'
