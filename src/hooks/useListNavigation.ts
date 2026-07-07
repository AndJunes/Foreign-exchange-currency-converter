interface ListNavigationOptions {
  /** Number of items currently in the list. */
  length: number
  /** Index of the highlighted item. */
  active: number
  /** Move the highlight to a new (already clamped) index. */
  onActiveChange: (index: number) => void
  /** Confirm the highlighted item. */
  onSelect: (index: number) => void
  /** Dismiss the widget. */
  onClose: () => void
}

/** Keyboard model for listbox-style widgets: ↑/↓ move the highlight (clamped
 *  to the list), Enter selects it and Escape closes. Returns a keydown
 *  handler so components stay focused on rendering. */
export function useListNavigation({
  length,
  active,
  onActiveChange,
  onSelect,
  onClose,
}: ListNavigationOptions) {
  return function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        onActiveChange(Math.min(active + 1, length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        onActiveChange(Math.max(active - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        onSelect(active)
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }
}
