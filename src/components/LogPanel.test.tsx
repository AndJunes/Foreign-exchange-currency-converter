import { describe, expect, it, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LogPanel } from './LogPanel'
import type { LogEntry } from '../types'

afterEach(cleanup)

const ENTRIES: LogEntry[] = [
  { id: 'a', from: 'USD', to: 'EUR', amount: 1000, result: 853.02, rate: 0.853, at: Date.now() },
  { id: 'b', from: 'GBP', to: 'USD', amount: 250, result: 339.38, rate: 1.3575, at: Date.now() },
]

describe('LogPanel', () => {
  it('shows an empty state when there are no entries', () => {
    render(<LogPanel entries={[]} onClear={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/no conversions logged yet/i)).toBeTruthy()
  })

  it('renders one row per entry with amounts and results', () => {
    render(<LogPanel entries={ENTRIES} onClear={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('1,000.00')).toBeTruthy()
    expect(screen.getByText('853.02')).toBeTruthy()
    expect(screen.getByText(/2 logged/i)).toBeTruthy()
  })

  it('deletes a single entry', () => {
    const onDelete = vi.fn()
    render(<LogPanel entries={ENTRIES} onClear={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete conversion usd to eur/i }))
    expect(onDelete).toHaveBeenCalledWith('a')
  })

  it('clears the whole log', () => {
    const onClear = vi.fn()
    render(<LogPanel entries={ENTRIES} onClear={onClear} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
    expect(onClear).toHaveBeenCalled()
  })
})
