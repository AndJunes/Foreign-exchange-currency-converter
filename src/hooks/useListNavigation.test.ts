import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useListNavigation } from './useListNavigation'

function makeEvent(key: string) {
  return { key, preventDefault: vi.fn() } as unknown as React.KeyboardEvent
}

function setup(active = 1, length = 3) {
  const onActiveChange = vi.fn()
  const onSelect = vi.fn()
  const onClose = vi.fn()
  const { result } = renderHook(() =>
    useListNavigation({ length, active, onActiveChange, onSelect, onClose }),
  )
  return { onKeyDown: result.current, onActiveChange, onSelect, onClose }
}

describe('useListNavigation', () => {
  it('moves the highlight down and up', () => {
    const { onKeyDown, onActiveChange } = setup(1)
    onKeyDown(makeEvent('ArrowDown'))
    expect(onActiveChange).toHaveBeenCalledWith(2)
    onKeyDown(makeEvent('ArrowUp'))
    expect(onActiveChange).toHaveBeenCalledWith(0)
  })

  it('clamps the highlight to the list bounds', () => {
    const bottom = setup(2)
    bottom.onKeyDown(makeEvent('ArrowDown'))
    expect(bottom.onActiveChange).toHaveBeenCalledWith(2)

    const top = setup(0)
    top.onKeyDown(makeEvent('ArrowUp'))
    expect(top.onActiveChange).toHaveBeenCalledWith(0)
  })

  it('selects the active item with Enter', () => {
    const { onKeyDown, onSelect } = setup(1)
    onKeyDown(makeEvent('Enter'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('closes with Escape', () => {
    const { onKeyDown, onClose } = setup(1)
    onKeyDown(makeEvent('Escape'))
    expect(onClose).toHaveBeenCalled()
  })

  it('ignores unrelated keys without preventing default', () => {
    const { onKeyDown, onActiveChange, onSelect, onClose } = setup(1)
    const event = makeEvent('a')
    onKeyDown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(onActiveChange).not.toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
