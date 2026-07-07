import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Call `onClose` when a pointer-down lands outside `ref` while `active`.
 *  Uses `pointerdown` so mouse, touch and pen input are all covered.
 *  Shared by the popover-style widgets (currency picker, mobile tabs menu). */
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [ref, active, onClose])
}
