import { useCallback, useEffect, useRef, useState } from 'react'

export interface Async<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface AsyncOptions {
  /** Keep the previous data while reloading and after a failed refresh,
   *  so a transient error never blanks an already-working UI. */
  keepStaleData?: boolean
  /** Auto-refresh interval in milliseconds. */
  refreshMs?: number
}

/** Shared async lifecycle for the data hooks: loading/error state, manual
 *  refresh, optional polling, and a generation counter that discards late
 *  responses (an in-flight fetch for old deps can never overwrite fresher
 *  data, including fetches started by the polling interval). */
export function useAsyncData<T>(fetcher: () => Promise<T>, options: AsyncOptions = {}) {
  const { keepStaleData = false, refreshMs } = options
  const [state, setState] = useState<Async<T>>({ data: null, loading: true, error: null })
  const generation = useRef(0)

  const load = useCallback(() => {
    const gen = ++generation.current
    setState((s) => ({
      data: keepStaleData ? s.data : null,
      loading: true,
      error: keepStaleData ? s.error : null,
    }))
    fetcher()
      .then((data) => {
        if (generation.current === gen) setState({ data, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (generation.current === gen) {
          setState((s) => ({
            data: keepStaleData ? s.data : null,
            loading: false,
            error: String(e),
          }))
        }
      })
  }, [fetcher, keepStaleData])

  useEffect(() => {
    // The counter (not a DOM node) is intentionally bumped on cleanup so
    // in-flight requests are ignored when deps change or the hook unmounts.
    const gen = generation
    load()
    return () => {
      gen.current++
    }
  }, [load])

  useEffect(() => {
    if (!refreshMs) return
    const id = setInterval(load, refreshMs)
    return () => clearInterval(id)
  }, [load, refreshMs])

  return { ...state, refresh: load }
}
