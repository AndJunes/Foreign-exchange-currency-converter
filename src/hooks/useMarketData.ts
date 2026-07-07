import { useCallback } from 'react'
import { fetchCurrencies, fetchMarket, fetchTimeseries } from '../lib/api'
import { useAsyncData } from './useAsyncData'
import type { Async } from './useAsyncData'
import type { Currency, CurrencyCode, HistoryPoint, RangeKey } from '../types'

export type { Async }

/** ECB rates are end-of-day, so an hourly poll is more than enough. */
const MARKET_REFRESH_MS = 3_600_000

/** Available currencies (fetched once). */
export function useCurrencies(): Async<Currency[]> {
  return useAsyncData(fetchCurrencies)
}

/** Market snapshot for a base currency, refreshable and auto-refreshed
 *  hourly. Keeps the last good snapshot when a refresh fails so the UI
 *  never blanks over a transient network error. */
export function useMarket(base: CurrencyCode) {
  const fetcher = useCallback(() => fetchMarket(base), [base])
  return useAsyncData(fetcher, { keepStaleData: true, refreshMs: MARKET_REFRESH_MS })
}

/** Rate history for the active pair + range. */
export function useHistory(from: CurrencyCode, to: CurrencyCode, range: RangeKey): Async<HistoryPoint[]> {
  const fetcher = useCallback(() => fetchTimeseries(from, to, range), [from, to, range])
  return useAsyncData(fetcher)
}
