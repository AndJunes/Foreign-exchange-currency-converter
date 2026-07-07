import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Currency, CurrencyCode } from '../types'
import { useListNavigation } from '../hooks/useListNavigation'
import { usePopover } from '../hooks/usePopover'
import { splitPopular } from '../lib/popular'
import { Flag } from './Flag'
import { CheckIcon, ChevronDownIcon, SearchIcon } from './Icons'

interface CurrencyPickerProps {
  currencies: Currency[]
  value: CurrencyCode
  onChange: (code: CurrencyCode) => void
  /** Optional label read by screen readers, e.g. "Send currency". */
  label?: string
}

/** Panel geometry — single source of truth for the rendered width and the
 *  flip-to-left calculation that keeps the panel on-screen. */
const PANEL_MAX_W = 376
const PANEL_VW = 0.85

export function CurrencyPicker({ currencies, value, onChange, label }: CurrencyPickerProps) {
  const { open, toggle, close, rootRef, triggerRef } = usePopover<
    HTMLDivElement,
    HTMLButtonElement
  >()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  // Anchor the panel to the trigger's right edge unless that would push it
  // past the left edge of the viewport — then anchor left instead.
  const [alignLeft, setAlignLeft] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return currencies
    return currencies.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    )
  }, [currencies, query])

  const { popular, other } = useMemo(() => splitPopular(filtered), [filtered])
  // Flat order used for keyboard navigation (popular first, then other).
  const flat = useMemo(() => [...popular, ...other], [popular, other])

  // Reset highlight to the selected item whenever the list changes.
  useEffect(() => {
    const idx = flat.findIndex((c) => c.code === value)
    setActive(idx >= 0 ? idx : 0)
  }, [flat, value])

  // Focus search on open and pick the panel anchor that stays on-screen.
  useEffect(() => {
    if (open) {
      setQuery('')
      const rect = rootRef.current?.getBoundingClientRect()
      if (rect) {
        const panelW = Math.min(PANEL_MAX_W, window.innerWidth * PANEL_VW)
        setAlignLeft(rect.right - panelW < 8)
      }
      // The panel is committed by the time this effect runs, so focus directly.
      searchRef.current?.focus()
    }
  }, [open, rootRef])

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function commit(code: CurrencyCode) {
    onChange(code)
    close()
  }

  // Keyboard behaviour lives in the shared useListNavigation hook; keeping
  // the highlight scrolled into view is handled by the effect above.
  const onKeyDown = useListNavigation({
    length: flat.length,
    active,
    onActiveChange: setActive,
    onSelect: (i) => {
      const c = flat[i]
      if (c) commit(c.code)
    },
    onClose: close,
  })

  // Options are plain divs (not buttons) so the option role isn't mixed with
  // implicit button semantics; the search input drives them as a composite
  // widget via aria-activedescendant and the shared keyboard model.
  const renderRow = (c: Currency, idx: number) => {
    const isSelected = c.code === value
    const isActive = idx === active
    return (
      <div
        key={c.code}
        role="option"
        id={`${listboxId}-option-${idx}`}
        aria-selected={isSelected}
        data-idx={idx}
        onMouseEnter={() => setActive(idx)}
        onClick={() => commit(c.code)}
        className={`flex w-full shrink-0 items-center gap-3 rounded px-2 py-3 text-left transition-colors ${
          isActive ? 'bg-border-strong' : ''
        }`}
      >
        <Flag code={c.code} size={20} />
        <span className="shrink-0 text-sm leading-[1.2] tracking-[0.0714em]">{c.code}</span>
        <span className="flex-1 truncate text-xs leading-[1.2] tracking-[0.0417em] text-muted">{c.name}</span>
        {isSelected && <CheckIcon size={12} className="shrink-0 text-accent-text" />}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ? `${label}: ${value}` : value}
        onClick={toggle}
        className="flex items-center gap-2 rounded-lg border border-control-border bg-control p-2.5 text-sm font-normal leading-[1.2] tracking-[0.0714em] transition-all hover:brightness-110 active:scale-[0.97]"
      >
        <Flag code={value} size={20} />
        <span>{value}</span>
        <ChevronDownIcon
          size={12}
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          style={{ width: `min(${PANEL_MAX_W}px, ${PANEL_VW * 100}vw)` }}
          className={`animate-fade-up absolute top-full z-30 mt-2 flex max-h-[min(458px,70vh)] flex-col gap-2.5 rounded-lg border border-control-border bg-surface-2 p-2 shadow-[0px_20px_60px_0px_rgba(10,10,10,0.5)] ${
            alignLeft ? 'left-0' : 'right-0'
          }`}
        >
          <div className="flex shrink-0 items-center gap-2.5 rounded-[6px] border border-muted px-3 py-3">
            <SearchIcon size={15} className="text-muted" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search currencies..."
              aria-label="Search currencies"
              aria-controls={listboxId}
              aria-activedescendant={flat.length > 0 ? `${listboxId}-option-${active}` : undefined}
              autoComplete="off"
              className="w-full bg-transparent text-xs leading-[1.2] tracking-[0.0417em] outline-none placeholder:text-muted"
            />
          </div>

          {/* The empty message lives outside the listbox: only option/group
              elements are valid owned children of role="listbox". */}
          {flat.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">No currencies match “{query}”.</p>
          )}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={label ?? 'Currencies'}
            className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
          >
            {popular.length > 0 && (
              <div role="group" aria-label="Popular" className="flex flex-col gap-1">
                <GroupHeader label="Popular" count={popular.length} />
                {popular.map((c, i) => renderRow(c, i))}
              </div>
            )}
            {other.length > 0 && (
              <div role="group" aria-label="Other currencies" className="flex flex-col gap-1">
                <GroupHeader label="Other currencies" count={other.length} />
                {other.map((c, i) => renderRow(c, popular.length + i))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    // Visual header only — the enclosing role="group" carries the label.
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-between border-b border-border-strong p-2 text-xs uppercase leading-[1.2] tracking-[0.0417em] text-muted"
    >
      <span>{label}</span>
      <span className="tnum">{count}</span>
    </div>
  )
}
