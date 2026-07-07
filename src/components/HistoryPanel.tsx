import type { CurrencyCode, RangeKey } from '../types'
import { useHistory } from '../hooks/useMarketData'
import { formatRate, formatSignedRate, formatTimestamp } from '../lib/format'
import { Delta } from './Delta'
import { RateChart } from './RateChart'

const RANGES: RangeKey[] = ['1d', '1w', '1m', '3m', '1y', '5y']

interface HistoryPanelProps {
  from: CurrencyCode
  to: CurrencyCode
  range: RangeKey
  onRangeChange: (r: RangeKey) => void
}

export function HistoryPanel({ from, to, range, onRangeChange }: HistoryPanelProps) {
  const { data: points, loading, error } = useHistory(from, to, range)
  const pair = `${from}/${to}`

  const stats = (() => {
    if (!points || points.length === 0) return null
    const open = points[0].value
    const last = points[points.length - 1].value
    const change = last - open
    const pct = open !== 0 ? (change / open) * 100 : NaN
    return { open, last, change, pct, date: points[points.length - 1].date }
  })()

  return (
    <div className="flex flex-col gap-5">
      {/* Stats + range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:flex lg:w-auto">
          <Stat label="Open" value={stats ? formatRate(stats.open) : '—'} />
          <Stat label="Last" value={stats ? formatRate(stats.last) : '—'} />
          <Stat
            label="Change"
            value={stats ? formatSignedRate(stats.change) : '—'}
            tone={stats ? (stats.change >= 0 ? 'pos' : 'neg') : undefined}
          />
          <Stat label="% change" value={stats ? <Delta pct={stats.pct} /> : '—'} />
        </div>

        <div
          role="group"
          aria-label="Chart range"
          className="flex rounded-lg bg-surface p-0.5"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRangeChange(r)}
              aria-pressed={r === range}
              className={`rounded-lg px-3 py-2.5 text-xs font-normal uppercase leading-[1.2] tracking-[0.5px] transition-colors sm:px-4 sm:py-3 ${
                r === range ? 'bg-border-strong text-text' : 'text-muted hover:text-text'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart card */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-medium leading-[1.2] tracking-[1px]">{pair}</h3>
          {stats && (
            <p className="text-xs uppercase leading-[1.2] tracking-[0.5px] text-text/70 tnum">
              {formatRate(stats.last)} · {formatTimestamp(stats.date)}
            </p>
          )}
        </div>

        <div className="min-h-64">
          {error ? (
            <ChartMessage
              title="No chart data available"
              body={`We couldn't load rate history for ${pair} right now. This usually clears up in a minute.`}
            />
          ) : loading ? (
            <div className="grid h-64 place-items-center text-sm text-muted">Loading rate history…</div>
          ) : points && points.length > 1 ? (
            <RateChart points={points} range={range} pair={pair} />
          ) : (
            <ChartMessage title="No chart data available" body={`Not enough data points for ${pair} over ${range}.`} />
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: React.ReactNode
  tone?: 'pos' | 'neg'
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong sm:px-5 lg:min-w-[140px]">
      <p className="text-sm uppercase leading-[1.2] tracking-[1px] text-text/70">{label}</p>
      <p
        className={`text-[1.25rem] font-normal leading-[1.2] tracking-[-0.5px] tnum ${
          tone === 'pos' ? 'text-pos' : tone === 'neg' ? 'text-neg' : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function ChartMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-border-strong bg-surface-2/40 px-6 text-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      </div>
    </div>
  )
}
