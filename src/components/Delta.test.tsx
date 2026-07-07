import { describe, expect, it, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Delta } from './Delta'

afterEach(cleanup)

describe('Delta', () => {
  it('renders a signed positive percentage in the positive tone', () => {
    render(<Delta pct={0.16} />)
    const el = screen.getByText('+0.16%')
    expect(el.className).toContain('text-pos')
  })

  it('renders a negative percentage in the negative tone', () => {
    render(<Delta pct={-0.22} />)
    const el = screen.getByText('-0.22%')
    expect(el.className).toContain('text-neg')
  })

  it('renders an em dash for non-finite values', () => {
    render(<Delta pct={NaN} />)
    expect(screen.getByText('—')).toBeTruthy()
  })
})
