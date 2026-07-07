import { describe, expect, it, vi, afterEach, beforeAll } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CurrencyPicker } from './CurrencyPicker'
import type { Currency } from '../types'

afterEach(cleanup)

beforeAll(() => {
  // jsdom does not implement scrollIntoView, used to keep the highlight visible.
  Element.prototype.scrollIntoView = vi.fn()
})

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'DKK', name: 'Danish Krone' },
]

function renderPicker(onChange = vi.fn()) {
  render(
    <CurrencyPicker currencies={CURRENCIES} value="USD" onChange={onChange} label="Send currency" />,
  )
  return onChange
}

describe('CurrencyPicker', () => {
  it('opens the listbox and focuses the search input', () => {
    renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /send currency/i }))
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /search/i }))
  })

  it('filters currencies by code or name', () => {
    renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /send currency/i }))
    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'krone' },
    })
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0].textContent).toContain('DKK')
  })

  it('selects the highlighted option with arrow keys and Enter', () => {
    const onChange = renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /send currency/i }))
    const search = screen.getByRole('textbox', { name: /search/i })
    // Highlight starts on the selected value (USD, first popular option).
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('EUR')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('closes with Escape and returns focus to the trigger', () => {
    renderPicker()
    const trigger = screen.getByRole('button', { name: /send currency/i })
    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('textbox', { name: /search/i }), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('marks the current value as selected in the list', () => {
    renderPicker()
    fireEvent.click(screen.getByRole('button', { name: /send currency/i }))
    const selected = screen
      .getAllByRole('option')
      .find((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected?.textContent).toContain('USD')
  })
})
