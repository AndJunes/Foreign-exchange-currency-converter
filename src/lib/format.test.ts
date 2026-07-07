import { describe, expect, it } from 'vitest'
import {
  formatAmount,
  formatAxisDate,
  formatFullDate,
  formatPercent,
  formatRate,
  formatSignedRate,
  parseAmount,
  relativeTime,
} from './format'

describe('parseAmount', () => {
  it('parses plain numbers', () => {
    expect(parseAmount('1000')).toBe(1000)
    expect(parseAmount('0.5')).toBe(0.5)
  })

  it('parses numbers with thousands separators', () => {
    expect(parseAmount('1,000')).toBe(1000)
    expect(parseAmount('12,345.67')).toBeCloseTo(12345.67)
  })

  it('returns NaN for empty or invalid input', () => {
    expect(parseAmount('')).toBeNaN()
    expect(parseAmount('   ')).toBeNaN()
    expect(parseAmount('abc')).toBeNaN()
  })
})

describe('formatAmount', () => {
  it('adds thousands separators and two decimals', () => {
    expect(formatAmount(1000)).toBe('1,000.00')
    expect(formatAmount(853.021)).toBe('853.02')
  })

  it('returns an em dash for non-finite values', () => {
    expect(formatAmount(NaN)).toBe('—')
    expect(formatAmount(Infinity)).toBe('—')
  })
})

describe('formatRate', () => {
  it('uses 4 decimals for small rates', () => {
    expect(formatRate(0.853)).toBe('0.8530')
    expect(formatRate(1.3575)).toBe('1.3575')
  })

  it('uses 2 decimals for large rates', () => {
    expect(formatRate(157.91)).toBe('157.91')
  })

  it('returns an em dash for non-finite values', () => {
    expect(formatRate(NaN)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('adds a plus sign for positive values', () => {
    expect(formatPercent(0.16)).toBe('+0.16%')
  })

  it('keeps the minus sign for negative values', () => {
    expect(formatPercent(-0.22)).toBe('-0.22%')
  })

  it('returns an em dash for non-finite values', () => {
    expect(formatPercent(NaN)).toBe('—')
  })
})

describe('formatSignedRate', () => {
  it('signs positive and negative changes', () => {
    expect(formatSignedRate(0.0014)).toBe('+0.0014')
    expect(formatSignedRate(-0.0014)).toBe('−0.0014')
  })

  it('returns an em dash for non-finite values', () => {
    expect(formatSignedRate(NaN)).toBe('—')
  })
})

describe('relativeTime', () => {
  const now = Date.UTC(2026, 6, 6, 12, 0, 0)

  it('returns "now" for less than a minute', () => {
    expect(relativeTime(now - 30_000, now)).toBe('now')
  })

  it('returns minutes under an hour', () => {
    expect(relativeTime(now - 20 * 60_000, now)).toBe('20m')
  })

  it('returns hours under a day', () => {
    expect(relativeTime(now - 4 * 3_600_000, now)).toBe('4h')
  })

  it('returns a short date after a day', () => {
    expect(relativeTime(now - 3 * 86_400_000, now)).toMatch(/Jul 3/)
  })
})

describe('formatFullDate', () => {
  it('shows month, day and year regardless of chart range', () => {
    expect(formatFullDate('2026-05-14')).toBe('May 14, 2026')
  })
})

describe('formatAxisDate', () => {
  it('shows month and day for short ranges', () => {
    expect(formatAxisDate('2026-05-14', '1m')).toBe('May 14')
  })

  it('shows only the month for medium ranges', () => {
    expect(formatAxisDate('2026-05-14', '1y')).toBe('May')
  })

  it('shows the year for long ranges', () => {
    expect(formatAxisDate('2026-05-14', '5y')).toBe('2026')
  })
})
