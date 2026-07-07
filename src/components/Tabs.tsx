import { useEffect } from 'react'
import type { TabKey } from '../types'
import { usePopover } from '../hooks/usePopover'
import { ChevronDownIcon } from './Icons'

interface TabDef {
  key: TabKey
  label: string
  badge?: number
}

interface TabsProps {
  tabs: TabDef[]
  active: TabKey
  onChange: (key: TabKey) => void
  panelId: string
}

export function Tabs({ tabs, active, onChange, panelId }: TabsProps) {
  // APG tablist arrows: selection and focus move together (roving tabindex),
  // wrapping at the edges; Home/End jump to the first/last tab.
  function onKeyDown(e: React.KeyboardEvent) {
    const idx = tabs.findIndex((t) => t.key === active)
    let next = -1
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    const key = tabs[next].key
    onChange(key)
    document.getElementById(`tab-${key}`)?.focus()
  }

  return (
    <>
      {/* Mobile: custom dropdown */}
      <MobileTabsMenu tabs={tabs} active={active} onChange={onChange} />

      {/* Desktop: underline tablist */}
      <div
        role="tablist"
        aria-label="Data panels"
        onKeyDown={onKeyDown}
        className="hidden gap-2 border-b border-border sm:flex"
      >
        {tabs.map((t) => {
          const selected = t.key === active
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              id={`tab-${t.key}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.key)}
              className="group flex flex-col items-center"
            >
              <span className="flex h-10 items-center justify-center gap-2 px-4 text-base font-normal uppercase leading-[1.2] tracking-[0.0625em] text-text">
                {t.label}
                <Badge count={t.badge} />
              </span>
              <span
                className={`h-0.5 w-full transition-colors ${
                  selected ? 'bg-accent' : 'bg-transparent group-hover:bg-border-strong'
                }`}
              />
            </button>
          )
        })}
      </div>
    </>
  )
}

function MobileTabsMenu({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[]
  active: TabKey
  onChange: (key: TabKey) => void
}) {
  const { open, toggle, close, rootRef, triggerRef } = usePopover<
    HTMLDivElement,
    HTMLButtonElement
  >()
  const activeTab = tabs.find((t) => t.key === active)

  function commit(key: TabKey) {
    onChange(key)
    close()
  }

  // Focus the selected option when the menu opens so arrow keys start there.
  useEffect(() => {
    if (open) {
      rootRef.current
        ?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')
        ?.focus()
    }
  }, [open, rootRef])

  // Escape closes and restores focus; ↑/↓/Home/End move focus through the
  // options while the listbox is open, matching the desktop tablist arrows.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (!open || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const options = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
    )
    if (options.length === 0) return
    const current = options.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? options.length - 1
          : e.key === 'ArrowDown'
            ? Math.min(current < 0 ? 0 : current + 1, options.length - 1)
            : Math.max(current < 0 ? options.length - 1 : current - 1, 0)
    options[next]?.focus()
  }

  return (
    <div ref={rootRef} className="relative sm:hidden" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select panel"
        onClick={toggle}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-control-border bg-surface px-3 text-base font-normal uppercase leading-[1.2] tracking-[0.0625em] text-text transition-colors hover:border-border-strong"
      >
        <span className="flex items-center gap-2">
          {activeTab?.label}
          <Badge count={activeTab?.badge} />
        </span>
        <ChevronDownIcon
          size={16}
          className={`text-text transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Data panels"
          className="animate-fade-up absolute inset-x-0 top-full z-30 mt-2 flex flex-col overflow-hidden rounded-[10px] border-b border-border bg-surface p-2 shadow-[0px_12px_40px_0px_rgba(0,0,0,0.4)]"
        >
          {tabs.map((t) => {
            const selected = t.key === active
            return (
              <button
                key={t.key}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => commit(t.key)}
                className={`flex h-10 w-full items-center justify-between rounded-[10px] px-2 text-base font-normal uppercase leading-[1.2] tracking-[0.0625em] text-text transition-colors ${
                  selected ? 'bg-surface-2' : 'hover:bg-surface-2/60'
                }`}
              >
                {t.label}
                <Badge count={t.badge} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Badge({ count }: { count?: number }) {
  if (count == null || count <= 0) return null
  return (
    <span className="grid size-5 place-items-center rounded-full bg-accent-deep text-[0.625rem] leading-none text-accent-text tnum">
      {count}
    </span>
  )
}
