/** Format a monetary amount with thousands separators and 2 decimals. */
export function formatAmount(value: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFractionDigits,
  })
}

/** Format an exchange rate. Rates can be tiny (JPY) or large, so we adapt. */
export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return '—'
  const digits = rate >= 100 ? 2 : 4
  return rate.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
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
  const d = new Date(at)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

/** e.g. "May 14 16:00 CET" — used next to the latest rate on the chart. */
export function formatTimestamp(dateIso: string): string {
  const d = new Date(`${dateIso}T16:00:00`)
  const md = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${md} 16:00 CET`
}

/** Axis-friendly date label for a range. */
export function formatAxisDate(dateIso: string, range: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  if (range === '1d' || range === '1w' || range === '1m') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (range === '3m' || range === '1y') {
    return d.toLocaleDateString('en-US', { month: 'short' })
  }
  return d.toLocaleDateString('en-US', { year: 'numeric' })
}
