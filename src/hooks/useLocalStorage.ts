import { useEffect, useState } from 'react'

/** State synced to localStorage, resilient to JSON/quota errors and
 *  kept in sync across tabs via the `storage` event. An optional type
 *  guard rejects legacy or corrupted stored shapes so bad data falls
 *  back to `initial` instead of reaching render. */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return initial
      const parsed: unknown = JSON.parse(raw)
      if (validate && !validate(parsed)) return initial
      return parsed as T
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore write failures (private mode / quota) */
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return
      try {
        const parsed: unknown = JSON.parse(e.newValue)
        if (validate && !validate(parsed)) return
        setValue(parsed as T)
      } catch {
        /* ignore corrupted cross-tab writes */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, validate])

  return [value, setValue] as const
}
