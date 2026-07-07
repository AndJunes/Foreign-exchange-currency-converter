import { formatPercent } from '../lib/format'
import { TriangleDownIcon, TriangleUpIcon } from './Icons'

interface DeltaProps {
  pct: number
  className?: string
  showArrow?: boolean
}

/** A signed percentage change with an up/down triangle, coloured green/red.
 *  Exactly zero renders neutral (muted, no arrow) — no change is not a gain. */
export function Delta({ pct, className = '', showArrow = true }: DeltaProps) {
  if (!Number.isFinite(pct)) {
    return <span className={`text-faint ${className}`}>—</span>
  }
  const tone = pct > 0 ? 'text-pos' : pct < 0 ? 'text-neg' : 'text-muted'
  return (
    <span className={`inline-flex items-center gap-1 tnum ${tone} ${className}`}>
      {showArrow && pct !== 0 && (pct > 0 ? <TriangleUpIcon size={8} /> : <TriangleDownIcon size={8} />)}
      {formatPercent(pct)}
    </span>
  )
}
