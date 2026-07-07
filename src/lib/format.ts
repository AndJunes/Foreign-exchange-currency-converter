const LOCALE = 'en-US'

// Hoisted formatter instances: Intl construction is comparatively expensive
// and these run for every row of the compare panel on each keystroke.
const AMOUNT_FMT = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const RATE_FMT_2 = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const RATE_FMT_4 = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})
// Preserves whatever precision the user typed while grouping thousands.
const EDITABLE_AMOUNT_FMT = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 20 })
const DAY_MONTH_FMT = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const MONTH_DAY_FMT = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric' })
const MONTH_FMT = new Intl.DateTimeFormat(LOCALE, { month: 'short' })
const YEAR_FMT = new Intl.DateTimeFormat(LOCALE, { year: 'numeric' })
const FULL_DATE_FMT = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** Format a monetary amount with thousands separators and 2 decimals. */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return AMOUNT_FMT.format(value)
}

/** Display formatting for the amount input: grouped thousands, but keeping
 *  the decimals the user typed (e.g. "1,000" / "1,000.5"). */
export function formatEditableAmount(value: number): string {
  if (!Number.isFinite(value)) return ''
  return EDITABLE_AMOUNT_FMT.format(value)
}

/** Format an exchange rate. Rates can be tiny (JPY) or large, so we adapt. */
export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return '—'
  return rate >= 100 ? RATE_FMT_2.format(rate) : RATE_FMT_4.format(rate)
}

/** Signed percentage, e.g. +1.24% / -0.80%. */
export function formatPercent(pct: number): string {
  if (!Number.isFinite(pct)) return '—'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

/** Signed absolute change on a rate. */
export function formatSignedRate(change: number): string {
  if (!Number.isFinite(change)) return '—'
  const sign = change > 0 ? '+' : change < 0 ? '−' : ''
  return `${sign}${formatRate(Math.abs(change))}`
}

/** Parse a possibly-formatted user amount string into a number. */
export function parseAmount(input: string): number {
  const cleaned = input.replace(/,/g, '').trim()
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

/** Compact relative time for the conversion log: 20m, 1h, 13 May. */
export function relativeTime(at: number, now = Date.now()): string {
  const diff = Math.max(0, now - at)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  return DAY_MONTH_FMT.format(new Date(at))
}

/** Publication date of the latest ECB reference rate, e.g. "May 14" —
 *  shown next to the last value on the chart. The rates are end-of-day
 *  values, so a fabricated wall-clock time would be misleading. */
export function formatTimestamp(dateIso: string): string {
  return MONTH_DAY_FMT.format(new Date(`${dateIso}T00:00:00`))
}

/** Unambiguous full date, e.g. "May 14, 2026" — used where a data point is
 *  announced or shown on its own (chart tooltip and screen reader output). */
export function formatFullDate(dateIso: string): string {
  return FULL_DATE_FMT.format(new Date(`${dateIso}T00:00:00`))
}

/** Axis-friendly date label for a range. */
export function formatAxisDate(dateIso: string, range: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  if (range === '1d' || range === '1w' || range === '1m') return MONTH_DAY_FMT.format(d)
  if (range === '3m' || range === '1y') return MONTH_FMT.format(d)
  return YEAR_FMT.format(d)
}
