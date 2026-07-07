import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

// Deterministic in-memory Storage stub — the global provided by the test
// environment does not implement the full Storage interface.
const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
})

beforeEach(() => store.clear())

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('round-trips values through localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'a'))
    act(() => result.current[1]('b'))
    expect(JSON.parse(store.get('k')!)).toBe('b')
  })

  it('falls back to the initial value on corrupted JSON', () => {
    store.set('k', '{not json')
    const { result } = renderHook(() => useLocalStorage('k', 'safe'))
    expect(result.current[0]).toBe('safe')
  })

  it('rejects stored values that fail the type guard', () => {
    store.set('k', '{}')
    const isArray = (v: unknown): v is string[] => Array.isArray(v)
    const { result } = renderHook(() => useLocalStorage<string[]>('k', [], isArray))
    expect(result.current[0]).toEqual([])
  })

  it('accepts stored values that pass the type guard', () => {
    store.set('k', '["x"]')
    const isArray = (v: unknown): v is string[] => Array.isArray(v)
    const { result } = renderHook(() => useLocalStorage<string[]>('k', [], isArray))
    expect(result.current[0]).toEqual(['x'])
  })
})
