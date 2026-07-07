import { useMemo } from 'react'
import type { Currency, CurrencyCode, Market } from '../types'
import { convert, crossRate } from '../lib/rates'
import { formatAmount, formatRate, parseAmount } from '../lib/format'
import { Flag } from './Flag'
import { StarIcon } from './icons'
import { EmptyState } from './EmptyState'

interface ComparePanelProps {
  currencies: Currency[]
  market: Market | null
  base: CurrencyCode
  amount: string
  isPinned: (from: CurrencyCode, to: CurrencyCode) => boolean
  onTogglePin: (from: CurrencyCode, to: CurrencyCode) => void
}

export function ComparePanel({
  currencies, market, base, amount, isPinned, onTogglePin,
}: ComparePanelProps) {
  const amountNum = parseAmount(amount)
  const rows = useMemo(() => {
    if (!market || !Number.isFinite(amountNum)) return []
    return currencies
      .filter((c) => c.code !== base)
      .map((c) => ({
        code: c.code,
        name: c.name,
        rate: crossRate(market.latest, base, c.code),
        value: convert(market.latest, base, c.code, amountNum),
      }))
      .filter((r) => Number.isFinite(r.value))
  }, [currencies, market, base, amountNum])

  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return (
      <EmptyState
        title="No comparison available"
        body="Enter an amount in Send above to see what your money is worth in other currencies."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      {/* Header: amount + base, pair count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-medium uppercase leading-[1.2] tracking-[1px] tnum">
          {formatAmount(amountNum)} from {base}
        </h3>
        <p className="text-xs uppercase leading-[1.2] tracking-[0.5px] text-text/70 tnum">
          {rows.length} pairs
        </p>
      </div>

      {/* Linear rows */}
      <ul className="flex flex-col gap-3">
        {rows.map((r) => {
          const pinned = isPinned(base, r.code)
          return (
            <li
              key={r.code}
              className="flex items-center gap-4 rounded-[10px] border border-border-strong bg-surface-2 px-4 py-3 transition-colors hover:border-control-border sm:gap-5"
            >
              <Flag code={r.code} size={20} />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-[1.2] tracking-[1px]">{r.code}</p>
                <p className="mt-1 truncate text-xs leading-[1.2] tracking-[0.5px] text-muted">
                  {r.name}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                <p className="text-base leading-[1.2] tracking-[1px] tnum">
                  {formatAmount(r.value)}
                </p>
                <p className="text-[10px] leading-none text-muted tnum">@ {formatRate(r.rate)}</p>
              </div>
              <button
                type="button"
                onClick={() => onTogglePin(base, r.code)}
                aria-pressed={pinned}
                aria-label={pinned ? `Unpin ${base} to ${r.code}` : `Pin ${base} to ${r.code}`}
                className={`grid size-8 shrink-0 place-items-center rounded-lg border bg-surface-2 transition-all active:scale-95 ${
                  pinned
                    ? 'border-accent text-accent hover:bg-accent/10'
                    : 'border-border-strong text-muted hover:border-control-border hover:text-text'
                }`}
              >
                <StarIcon size={16} filled={pinned} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
