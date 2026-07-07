import { describe, expect, it } from 'vitest'
import { change24h, convert, crossRate } from './rates'
import type { Market, RateMap } from '../types'

const rates: RateMap = { USD: 1, EUR: 0.853, JPY: 157.91 }

describe('crossRate', () => {
  it('computes the direct rate between two currencies', () => {
    expect(crossRate(rates, 'USD', 'EUR')).toBeCloseTo(0.853)
  })

  it('computes the inverse rate', () => {
    expect(crossRate(rates, 'EUR', 'USD')).toBeCloseTo(1 / 0.853)
  })

  it('computes a cross rate through the base', () => {
    expect(crossRate(rates, 'EUR', 'JPY')).toBeCloseTo(157.91 / 0.853)
  })

  it('returns NaN when a currency is missing', () => {
    expect(crossRate(rates, 'USD', 'GBP')).toBeNaN()
    expect(crossRate(rates, 'GBP', 'USD')).toBeNaN()
  })
})

describe('convert', () => {
  it('multiplies the amount by the cross rate', () => {
    expect(convert(rates, 'USD', 'EUR', 1000)).toBeCloseTo(853)
  })

  it('is identity for the same currency', () => {
    expect(convert(rates, 'USD', 'USD', 42)).toBeCloseTo(42)
  })

  it('propagates NaN for unknown currencies', () => {
    expect(convert(rates, 'USD', 'XXX', 100)).toBeNaN()
  })
})

describe('change24h', () => {
  const market: Market = {
    base: 'USD',
    date: '2026-07-06',
    latest: { USD: 1, EUR: 0.853 },
    previous: { USD: 1, EUR: 0.85 },
  }

  it('returns the percentage change between previous and latest', () => {
    const expected = ((0.853 - 0.85) / 0.85) * 100
    expect(change24h(market, 'USD', 'EUR')).toBeCloseTo(expected)
  })

  it('is negative when the rate falls', () => {
    const falling: Market = { ...market, latest: { USD: 1, EUR: 0.84 } }
    expect(change24h(falling, 'USD', 'EUR')).toBeLessThan(0)
  })

  it('returns NaN when data is missing', () => {
    expect(change24h(market, 'USD', 'GBP')).toBeNaN()
  })
})
