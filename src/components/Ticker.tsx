import { useMemo } from 'react'
import type { Market } from '../types'
import { change24h, crossRate } from '../lib/rates'
import { formatRate } from '../lib/format'
import { TICKER_PAIRS } from '../lib/tickerPairs'
import { Delta } from './Delta'

interface TickerProps {
  market: Market | null
}

export function Ticker({ market }: TickerProps) {
  const items = useMemo(() => {
    if (!market) return []
    return TICKER_PAIRS.map(([from, to]) => ({
      from,
      to,
      rate: crossRate(market.latest, from, to),
      change: change24h(market, from, to),
    })).filter((i) => Number.isFinite(i.rate))
  }, [market])

  return (
    <section
      aria-label="Live markets"
      // Focusable so keyboard users can pause the marquee, mirroring hover.
      tabIndex={0}
      className="group overflow-hidden bg-surface"
    >
      <div className="flex items-stretch">
        <div className="z-20 flex shrink-0 items-center gap-2 bg-accent px-3 py-2 sm:px-4 sm:py-3">
          <span className="size-1.5 rounded-full bg-accent-ink" aria-hidden />
          <span className="text-xs font-medium uppercase leading-[1.3] tracking-[0.5px] text-accent-ink">
            Live markets
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          {/* Edge fades so items appear/disappear smoothly */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface to-transparent" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface to-transparent" aria-hidden />
          {items.length === 0 ? (
            <div className="flex h-10 items-center px-5 text-xs text-muted">Loading rates…</div>
          ) : (
            <div
              className="flex w-max animate-ticker items-center group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
              style={{ ['--ticker-duration' as string]: `${items.length * 3.2}s` }}
            >
              {[0, 1].map((dup) => (
                <ul key={dup} className="flex items-stretch" aria-hidden={dup === 1}>
                  {items.map((i) => (
                    <li
                      key={`${dup}-${i.from}${i.to}`}
                      className="flex items-center gap-2.5 whitespace-nowrap border-r border-border-strong px-4 py-2 text-xs leading-[1.2] tracking-[0.5px] sm:px-5 sm:py-3"
                    >
                      <span className="text-muted">
                        {i.from}/{i.to}
                      </span>
                      <span className="font-medium leading-[1.3] text-text tnum">{formatRate(i.rate)}</span>
                      <Delta pct={i.change} className="text-xs" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
