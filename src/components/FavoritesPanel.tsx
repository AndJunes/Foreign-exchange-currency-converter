import type { CurrencyCode, FavoritePair, Market } from '../types'
import { change24h, crossRate } from '../lib/rates'
import { formatRate } from '../lib/format'
import { Delta } from './Delta'
import { StarIcon } from './Icons'
import { EmptyState } from './EmptyState'

interface FavoritesPanelProps {
  favorites: FavoritePair[]
  market: Market | null
  onSelect: (from: CurrencyCode, to: CurrencyCode) => void
  onUnpin: (from: CurrencyCode, to: CurrencyCode) => void
}

export function FavoritesPanel({ favorites, market, onSelect, onUnpin }: FavoritesPanelProps) {
  if (favorites.length === 0) {
    return (
      <EmptyState
        title="No pinned pairs yet"
        body="Pin a pair to track its rate here. Tap the star icon on any conversion or comparison row."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      {/* Header: title + count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-medium uppercase leading-[1.2] tracking-[0.0625em]">
          Pinned pairs
        </h3>
        <p className="text-xs uppercase leading-[1.2] tracking-[0.0417em] text-text/70 tnum">
          {favorites.length} favorites
        </p>
      </div>

      {/* Linear rows */}
      <ul className="flex flex-col gap-3">
        {favorites.map((f) => {
          const rate = market ? crossRate(market.latest, f.from, f.to) : NaN
          const change = market ? change24h(market, f.from, f.to) : NaN
          return (
            <li
              key={`${f.from}-${f.to}`}
              className="flex items-center gap-4 rounded-[10px] border border-border-strong bg-surface-2 px-4 py-3 transition-colors hover:border-control-border sm:gap-5"
            >
              <button
                type="button"
                onClick={() => onSelect(f.from, f.to)}
                aria-label={`Load ${f.from} to ${f.to} into the converter`}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm leading-[1.2] tracking-[0.0714em]"
              >
                {f.from}
                <span className="text-xs text-muted" aria-hidden>
                  →
                </span>
                {f.to}
              </button>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                <span className="text-base leading-[1.2] tracking-[0.0625em] tnum">
                  {formatRate(rate)}
                </span>
                <Delta pct={change} className="text-[0.625rem] leading-none" />
              </div>
              <button
                type="button"
                onClick={() => onUnpin(f.from, f.to)}
                aria-label={`Unpin ${f.from} to ${f.to}`}
                aria-pressed={true}
                className="grid size-8 shrink-0 place-items-center rounded-lg border border-accent bg-surface-2 text-accent transition-all hover:bg-accent/10 active:scale-95"
              >
                <StarIcon size={16} filled />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
