import { describe, expect, it, vi, afterEach, beforeAll } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { RateChart } from './RateChart'
import type { HistoryPoint } from '../types'

afterEach(cleanup)

beforeAll(() => {
  // jsdom implements neither ResizeObserver nor rAF-driven layout.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

const POINTS: HistoryPoint[] = [
  { date: '2026-06-05', value: 0.8591 },
  { date: '2026-06-12', value: 0.865 },
  { date: '2026-06-22', value: 0.871 },
  { date: '2026-07-06', value: 0.876 },
]

function renderChart() {
  render(<RateChart points={POINTS} range="1m" pair="USD/EUR" />)
  return screen.getByRole('region', { name: /rate history chart for usd\/eur/i })
}

describe('RateChart', () => {
  it('renders a keyboard-focusable chart with axis labels', () => {
    const chart = renderChart()
    expect(chart.getAttribute('tabindex')).toBe('0')
    expect(chart.getAttribute('aria-roledescription')).toBe('interactive chart')
    expect(screen.getByText('Jun 5')).toBeTruthy()
  })

  it('announces the last data point when pressing ArrowLeft', () => {
    const chart = renderChart()
    fireEvent.keyDown(chart, { key: 'ArrowLeft' })
    expect(screen.getByText('0.8760 on Jul 6, 2026')).toBeTruthy()
  })

  it('steps between points and clears with Escape', () => {
    const chart = renderChart()
    fireEvent.keyDown(chart, { key: 'Home' })
    expect(screen.getByText('0.8591 on Jun 5, 2026')).toBeTruthy()
    fireEvent.keyDown(chart, { key: 'ArrowRight' })
    expect(screen.getByText('0.8650 on Jun 12, 2026')).toBeTruthy()
    fireEvent.keyDown(chart, { key: 'Escape' })
    expect(screen.queryByText(/on Jun 12, 2026/)).toBeNull()
  })
})
