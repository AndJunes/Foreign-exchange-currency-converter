import { formatPercent } from '../lib/format'
import { TriangleDownIcon, TriangleUpIcon } from './Icons'

interface DeltaProps {
  pct: number
  className?: string
  showArrow?: boolean
}

/** A signed percentage change with an up/down triangle, coloured green/red. */
export function Delta({ pct, className = '', showArrow = true }: DeltaProps) {
  if (!Number.isFinite(pct)) {
    return <span className={`text-faint ${className}`}>—</span>
  }
  const up = pct >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 tnum ${up ? 'text-pos' : 'text-neg'} ${className}`}
    >
      {showArrow && (up ? <TriangleUpIcon size={8} /> : <TriangleDownIcon size={8} />)}
      {formatPercent(pct)}
    </span>
  )
}
