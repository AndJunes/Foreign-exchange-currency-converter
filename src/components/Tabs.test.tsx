import { describe, expect, it, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Tabs } from './Tabs'
import type { TabKey } from '../types'

afterEach(cleanup)

const TABS = [
  { key: 'history' as TabKey, label: 'History' },
  { key: 'compare' as TabKey, label: 'Compare' },
  { key: 'favorites' as TabKey, label: 'Favorites', badge: 10 },
  { key: 'log' as TabKey, label: 'Log', badge: 8 },
]

function renderTabs(active: TabKey = 'history', onChange = vi.fn()) {
  render(<Tabs tabs={TABS} active={active} onChange={onChange} panelId="panel" />)
  return onChange
}

describe('Tabs (desktop tablist)', () => {
  it('marks the active tab as selected', () => {
    renderTabs('history')
    const active = screen.getByRole('tab', { selected: true })
    expect(active.textContent).toContain('History')
  })

  it('shows notification badges with their counts', () => {
    renderTabs()
    const favorites = screen.getByRole('tab', { name: /favorites/i })
    expect(favorites.textContent).toContain('10')
    const log = screen.getByRole('tab', { name: /log/i })
    expect(log.textContent).toContain('8')
  })

  it('calls onChange when a tab is clicked', () => {
    const onChange = renderTabs('history')
    fireEvent.click(screen.getByRole('tab', { name: /compare/i }))
    expect(onChange).toHaveBeenCalledWith('compare')
  })

  it('moves to the next tab with ArrowRight, wrapping and moving focus', () => {
    const onChange = renderTabs('log')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('history')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: /history/i }))
  })

  it('moves to the previous tab with ArrowLeft', () => {
    const onChange = renderTabs('compare')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith('history')
  })

  it('jumps to the first and last tabs with Home and End', () => {
    const onChange = renderTabs('compare')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' })
    expect(onChange).toHaveBeenCalledWith('log')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' })
    expect(onChange).toHaveBeenCalledWith('history')
  })
})

describe('Tabs (mobile dropdown)', () => {
  it('opens the menu, selects an option, and closes it', () => {
    const onChange = renderTabs('history')
    const trigger = screen.getByRole('button', { name: 'Select panel' })

    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: /compare/i }))
    expect(onChange).toHaveBeenCalledWith('compare')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('closes the menu with Escape', () => {
    renderTabs()
    fireEvent.click(screen.getByRole('button', { name: 'Select panel' }))
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
