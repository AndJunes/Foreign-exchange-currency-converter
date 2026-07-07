import { useCallback, useRef, useState } from 'react'
import type { TabKey } from '../types'
import { useOutsideClick } from '../hooks/useOutsideClick'
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
  function onKeyDown(e: React.KeyboardEvent) {
    const idx = tabs.findIndex((t) => t.key === active)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const next = (idx + dir + tabs.length) % tabs.length
      onChange(tabs[next].key)
    }
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
              <span className="flex h-10 items-center justify-center gap-2 px-4 text-base font-normal uppercase leading-[1.2] tracking-[1px] text-text">
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
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const activeTab = tabs.find((t) => t.key === active)

  useOutsideClick(rootRef, open, useCallback(() => setOpen(false), []))

  function commit(key: TabKey) {
    onChange(key)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div ref={rootRef} className="relative sm:hidden" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select panel"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-control-border bg-surface px-3 text-base font-normal uppercase leading-[1.2] tracking-[1px] text-text transition-colors hover:border-border-strong"
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
                className={`flex h-10 w-full items-center justify-between rounded-[10px] px-2 text-base font-normal uppercase leading-[1.2] tracking-[1px] text-text transition-colors ${
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
    <span className="grid size-5 place-items-center rounded-full bg-accent-deep text-[10px] leading-none text-accent tnum">
      {count}
    </span>
  )
}
