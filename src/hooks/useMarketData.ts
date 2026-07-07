import { useCallback, useEffect, useState } from 'react'
import { fetchCurrencies, fetchMarket, fetchTimeseries } from '../lib/api'
import type { Currency, CurrencyCode, HistoryPoint, Market, RangeKey } from '../types'

interface Async<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Available currencies (fetched once). */
export function useCurrencies(): Async<Currency[]> {
  const [state, setState] = useState<Async<Currency[]>>({ data: null, loading: true, error: null })
  useEffect(() => {
    let alive = true
    fetchCurrencies()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e: unknown) =>
        alive && setState({ data: null, loading: false, error: String(e) }),
      )
    return () => {
      alive = false
    }
  }, [])
  return state
}

/** Market snapshot for a base currency, refreshable and auto-refreshed hourly. */
export function useMarket(base: CurrencyCode) {
  const [state, setState] = useState<Async<Market>>({ data: null, loading: true, error: null })

  const load = useCallback(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchMarket(base)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e: unknown) =>
        alive && setState((s) => ({ data: s.data, loading: false, error: String(e) })),
      )
    return () => {
      alive = false
    }
  }, [base])

  useEffect(() => load(), [load])
  useEffect(() => {
    const id = setInterval(() => load(), 3_600_000)
    return () => clearInterval(id)
  }, [load])

  return { ...state, refresh: load }
}

/** Rate history for the active pair + range. */
export function useHistory(from: CurrencyCode, to: CurrencyCode, range: RangeKey): Async<HistoryPoint[]> {
  const [state, setState] = useState<Async<HistoryPoint[]>>({ data: null, loading: true, error: null })
  useEffect(() => {
    let alive = true
    setState({ data: null, loading: true, error: null })
    fetchTimeseries(from, to, range)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e: unknown) =>
        alive && setState({ data: null, loading: false, error: String(e) }),
      )
    return () => {
      alive = false
    }
  }, [from, to, range])
  return state
}
