import type { LogEntry } from '../types'
import { formatAmount, relativeTime } from '../lib/format'
import { DeleteIcon } from './icons'
import { EmptyState } from './EmptyState'

interface LogPanelProps {
  entries: LogEntry[]
  onClear: () => void
  onDelete: (id: string) => void
}

export function LogPanel({ entries, onClear, onDelete }: LogPanelProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No conversions logged yet"
        body="Every conversion is recorded here automatically when you tap Log conversion. Your log is private to this session and this browser."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      {/* Header: title + count + clear */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-medium uppercase leading-[1.2] tracking-[1px]">
          Conversion log
        </h3>
        <div className="flex items-center gap-4">
          <p className="text-xs uppercase leading-[1.2] tracking-[0.5px] text-text/70 tnum">
            {entries.length} logged
          </p>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-control-border bg-surface-2 px-3 py-2 text-xs uppercase leading-[1.2] tracking-[0.5px] text-muted transition-colors hover:border-neg/50 hover:text-neg"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Linear rows */}
      <ul className="flex flex-col gap-3">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-center gap-3 rounded-[10px] border border-border-strong bg-surface-2 p-3 transition-colors hover:border-control-border sm:gap-4 sm:p-4"
          >
            <span className="w-12 shrink-0 text-sm uppercase leading-[1.2] tracking-[1px] text-muted tnum sm:w-16">
              {relativeTime(e.at)}
            </span>
            <p className="flex min-w-0 flex-1 items-center gap-2 text-sm leading-[1.2] tracking-[1px]">
              {e.from}
              <span className="text-xs text-muted" aria-hidden>
                →
              </span>
              <span className="sr-only">to</span>
              {e.to}
            </p>
            <div className="flex shrink-0 items-center justify-end gap-3 text-right text-sm leading-[1.2] tracking-[1px] tnum sm:gap-5 sm:text-base">
              <span className="text-label">{formatAmount(e.amount)}</span>
              <span className="text-accent">{formatAmount(e.result)}</span>
            </div>
            <button
              type="button"
              onClick={() => onDelete(e.id)}
              aria-label={`Delete conversion ${e.from} to ${e.to}`}
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-border-strong bg-surface-2 text-text transition-colors hover:border-neg/50 hover:text-neg"
            >
              <DeleteIcon size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
