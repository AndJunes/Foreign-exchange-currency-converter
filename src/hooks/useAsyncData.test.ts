import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useAsyncData } from './useAsyncData'

function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useAsyncData', () => {
  it('loads data and clears the loading flag', async () => {
    const fetcher = vi.fn(() => Promise.resolve('ok'))
    const { result } = renderHook(() => useAsyncData(fetcher))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.data).toBe('ok'))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('surfaces errors with no data by default', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('boom')))
    const { result } = renderHook(() => useAsyncData(fetcher))
    await waitFor(() => expect(result.current.error).toContain('boom'))
    expect(result.current.data).toBeNull()
  })

  it('keeps stale data across a failed refresh with keepStaleData', async () => {
    let call = 0
    const fetcher = vi.fn(() =>
      ++call === 1 ? Promise.resolve('good') : Promise.reject(new Error('down')),
    )
    const { result } = renderHook(() => useAsyncData(fetcher, { keepStaleData: true }))
    await waitFor(() => expect(result.current.data).toBe('good'))

    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.error).toContain('down'))
    expect(result.current.data).toBe('good')
  })

  it('ignores late responses from superseded requests', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    let call = 0
    const fetcher = vi.fn(() => (++call === 1 ? first.promise : second.promise))
    const { result } = renderHook(() => useAsyncData(fetcher, { keepStaleData: true }))

    act(() => result.current.refresh()) // supersedes the initial in-flight load
    second.resolve('fresh')
    await waitFor(() => expect(result.current.data).toBe('fresh'))

    first.resolve('stale') // the old request finally lands…
    await act(async () => {
      await first.promise
    })
    expect(result.current.data).toBe('fresh') // …and is discarded
  })
})
