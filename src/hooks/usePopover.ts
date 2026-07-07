import { useCallback, useRef, useState } from 'react'
import { useOutsideClick } from './useOutsideClick'

/** Open/close state shared by the popover-style widgets (currency picker,
 *  mobile tabs menu) with their common conventions:
 *  - an outside pointer-down dismisses WITHOUT stealing focus;
 *  - `close()` (Escape or selecting an item) dismisses AND returns focus
 *    to the trigger so keyboard users keep their place. */
export function usePopover<TRoot extends HTMLElement, TTrigger extends HTMLElement>() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<TRoot>(null)
  const triggerRef = useRef<TTrigger>(null)

  useOutsideClick(rootRef, open, useCallback(() => setOpen(false), []))

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  const toggle = useCallback(() => setOpen((o) => !o), [])

  return { open, setOpen, toggle, close, rootRef, triggerRef }
}
