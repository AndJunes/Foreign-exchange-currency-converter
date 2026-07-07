import { useId, useState } from 'react'
import type { Currency, CurrencyCode, Market } from '../types'
import { convert, crossRate } from '../lib/rates'
import { formatAmount, formatRate } from '../lib/format'
import { CurrencyPicker } from './CurrencyPicker'
import { ExchangeIcon, ExchangeVerticalIcon, StarIcon } from './Icons'

interface ConverterProps {
  currencies: Currency[]
  market: Market | null
  from: CurrencyCode
  to: CurrencyCode
  /** Raw input string (kept for editing) and its parsed value from the parent. */
  amount: string
  amountNum: number
  isFavorite: boolean
  onAmountChange: (v: string) => void
  onFromChange: (c: CurrencyCode) => void
  onToChange: (c: CurrencyCode) => void
  onSwap: () => void
  onToggleFavorite: () => void
  onLog: () => void
}

export function Converter(props: ConverterProps) {
  const {
    currencies, market, from, to, amount, amountNum, isFavorite,
    onAmountChange, onFromChange, onToChange, onSwap, onToggleFavorite, onLog,
  } = props

  const rate = market ? crossRate(market.latest, from, to) : NaN
  const result = market && Number.isFinite(amountNum) ? convert(market.latest, from, to, amountNum) : NaN
  const canLog = Number.isFinite(result) && amountNum > 0

  const sendId = useId()
  const receiveId = useId()

  // Show thousands separators (as in the design: "1,000") while not editing.
  const [editing, setEditing] = useState(false)
  const displayAmount =
    editing || !Number.isFinite(amountNum)
      ? amount
      : amountNum.toLocaleString('en-US', { maximumFractionDigits: 20 })

  return (
    <div>
      <h2 className="mb-4 text-[1.25rem] font-normal uppercase leading-[1.2] tracking-[-0.5px] text-heading">
        Check the rate
      </h2>

      <section
        aria-label="Currency converter"
        className="rounded-[20px] bg-surface shadow-[0px_12px_40px_0px_rgba(0,0,0,0.4)]"
      >
        <div className="relative flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-stretch md:gap-6">
          {/* Send */}
          <Field label="Send" htmlFor={sendId} className="md:flex-1">
            <input
              id={sendId}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={displayAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
              className="min-w-0 flex-1 bg-transparent text-[2.5rem] font-bold leading-none tracking-[-0.5px] tabular-nums outline-none placeholder:text-faint md:text-[2rem] lg:text-[2.5rem]"
              placeholder="0.00"
            />
            <CurrencyPicker
              currencies={currencies}
              value={from}
              onChange={onFromChange}
              label="Send currency"
            />
          </Field>

          {/* Swap — absolute-centered on mobile, inline between the two fields on desktop */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center md:static md:inset-auto md:top-auto md:translate-y-0 md:self-center">
            <button
              type="button"
              onClick={onSwap}
              aria-label="Swap send and receive currencies"
              className="group/swap pointer-events-auto grid size-12 place-items-center rounded-lg border border-border-strong bg-surface-2 text-text transition-colors hover:border-control-border hover:text-accent active:scale-95"
            >
              <span className="grid place-items-center transition-transform duration-300 group-hover/swap:rotate-180">
                <ExchangeVerticalIcon size={20} className="md:hidden" />
                <ExchangeIcon size={20} className="hidden md:block" />
              </span>
            </button>
          </div>

          {/* Receive */}
          <Field label="Receive" htmlFor={receiveId} className="md:flex-1">
            <output
              id={receiveId}
              aria-live="polite"
              className="block min-w-0 flex-1 truncate text-[2.5rem] font-bold leading-none tracking-[-0.5px] tabular-nums text-accent md:text-[2rem] lg:text-[2.5rem]"
            >
              {Number.isFinite(result) ? formatAmount(result) : '—'}
            </output>
            <CurrencyPicker
              currencies={currencies}
              value={to}
              onChange={onToChange}
              label="Receive currency"
            />
          </Field>
        </div>

        {/* Rate + actions */}
        <div className="flex flex-col gap-4 border-t border-dashed border-border-strong px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-xs leading-[1.2] tracking-[0.5px] tnum md:text-left" aria-live="polite">
            {Number.isFinite(rate) ? (
              <>1 {from} = {formatRate(rate)} {to}</>
            ) : (
              <span className="text-muted">Fetching live rate…</span>
            )}
          </p>

          <div className="flex items-center justify-center gap-3 md:justify-start">
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium uppercase leading-[1.3] tracking-[0.5px] transition-all active:scale-[0.97] ${
                isFavorite
                  ? 'border-accent bg-accent text-accent-ink'
                  : 'border-border-strong bg-surface-2 text-text hover:border-control-border'
              }`}
            >
              <StarIcon size={16} filled={isFavorite} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            <button
              type="button"
              onClick={onLog}
              disabled={!canLog}
              className="rounded-lg border border-accent px-3 py-2 text-xs font-medium uppercase leading-[1.3] tracking-[0.5px] text-text transition-all hover:bg-accent/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Log conversion
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
  className = '',
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex min-w-0 flex-col justify-end gap-5 rounded-2xl border border-border-strong bg-surface-2 p-4 transition-colors focus-within:border-accent/60 hover:border-control-border focus-within:hover:border-accent/60 sm:p-5 ${className}`}
    >
      <label
        htmlFor={htmlFor}
        className="block text-sm font-normal uppercase leading-[1.2] tracking-[1px] text-label"
      >
        {label}
      </label>
      <div className="flex items-center justify-between gap-3">{children}</div>
    </div>
  )
}
