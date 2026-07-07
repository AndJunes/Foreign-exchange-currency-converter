import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Call `onClose` when a pointer-down lands outside `ref` while `active`.
 *  Shared by the popover-style widgets (currency picker, mobile tabs menu). */
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, active, onClose])
}
