import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { HistoryPoint, RangeKey } from '../types'
import { formatAxisDate, formatRate } from '../lib/format'

interface RateChartProps {
  points: HistoryPoint[]
  range: RangeKey
  pair: string
}

export function RateChart({ points, range, pair }: RateChartProps) {
  const gradientId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [size, setSize] = useState({ w: 820, h: 300 })

  // Keep the SVG coordinate system at 1 unit = 1 CSS px so axis text renders
  // at its real font size on any viewport (no letterboxing or shrunken labels).
  // Updates are coalesced to one per frame so rapid resizes don't churn renders.
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    let frame = 0
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (width > 0 && height > 0) setSize({ w: width, h: height })
      })
    })
    ro.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [])

  const W = size.w
  const H = size.h
  const narrow = W < 480
  const PAD = useMemo(
    () => ({ top: 16, right: narrow ? 8 : 12, bottom: 28, left: narrow ? 48 : 54 }),
    [narrow],
  )

  const geom = useMemo(() => {
    const values = points.map((p) => p.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || max * 0.001 || 1
    const lo = min - span * 0.08
    const hi = max + span * 0.08
    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom
    const n = points.length
    const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW)
    const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * plotH
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
    const area = `${line} L${x(n - 1).toFixed(1)},${(H - PAD.bottom).toFixed(1)} L${x(0).toFixed(1)},${(H - PAD.bottom).toFixed(1)} Z`
    return { min, max, lo, hi, x, y, line, area, plotH }
  }, [points, W, H, PAD])

  const stroke = 'var(--accent)'

  const yTicks = [geom.hi, (geom.hi + geom.lo) / 2, geom.lo]
  const xTickIdx = pickXTicks(points.length, narrow ? 3 : 5)
  const lastTick = xTickIdx[xTickIdx.length - 1]

  function onMove(e: React.PointerEvent) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || points.length === 0) return
    const px = e.clientX - rect.left
    const frac = (px - PAD.left) / (W - PAD.left - PAD.right)
    const idx = Math.round(frac * (points.length - 1))
    setHover(Math.max(0, Math.min(points.length - 1, idx)))
  }

  // Keyboard access mirrors pointer hover: ←/→ step through data points,
  // Home/End jump to the range edges, Escape clears the crosshair.
  function onKeyDown(e: React.KeyboardEvent) {
    if (points.length === 0) return
    const last = points.length - 1
    const move = (idx: number) => {
      e.preventDefault()
      setHover(Math.max(0, Math.min(last, idx)))
    }
    if (e.key === 'ArrowLeft') move((hover ?? points.length) - 1)
    else if (e.key === 'ArrowRight') move((hover ?? -1) + 1)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(last)
    else if (e.key === 'Escape') setHover(null)
  }

  const hp = hover != null ? points[hover] : null

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-64 w-full touch-none rounded-lg sm:h-72"
        role="application"
        tabIndex={0}
        aria-label={`Rate history chart for ${pair} over ${range}. Use left and right arrow keys to explore data points.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {yTicks.map((v, i) => {
          const yy = geom.y(v)
          return (
            <g key={i}>
              <line x1={PAD.left} y1={yy} x2={W - PAD.right} y2={yy} stroke="var(--border)" strokeWidth={1} />
              <text x={PAD.left - 8} y={yy + 3} textAnchor="end" className="fill-[var(--muted)] text-[10px]">
                {formatRate(v)}
              </text>
            </g>
          )
        })}

        {/* X labels — first/last anchored inward so they never clip */}
        {xTickIdx.map((i) => (
          <text
            key={i}
            x={geom.x(i)}
            y={H - 8}
            textAnchor={i === 0 ? 'start' : i === lastTick ? 'end' : 'middle'}
            className="fill-[var(--muted)] text-[10px]"
          >
            {formatAxisDate(points[i].date, range)}
          </text>
        ))}

        <path d={geom.area} fill={`url(#${gradientId})`} />
        <path
          key={`${pair}-${range}-${points.length}`}
          d={geom.line}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          className="chart-draw"
          style={{ filter: `drop-shadow(0 0 6px color-mix(in oklab, ${stroke} 45%, transparent))` }}
        />

        {/* Latest data point with a pulsing halo */}
        {points.length > 0 && hover == null && (
          <g>
            <circle
              cx={geom.x(points.length - 1)}
              cy={geom.y(points[points.length - 1].value)}
              r={4}
              fill={stroke}
              className="chart-ping"
            />
            <circle
              cx={geom.x(points.length - 1)}
              cy={geom.y(points[points.length - 1].value)}
              r={3.5}
              fill={stroke}
              stroke="var(--surface)"
              strokeWidth={1.5}
            />
          </g>
        )}

        {/* Hover crosshair */}
        {hp && (
          <g>
            <line x1={geom.x(hover!)} y1={PAD.top} x2={geom.x(hover!)} y2={H - PAD.bottom} stroke="var(--border-strong)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={geom.x(hover!)} cy={geom.y(hp.value)} r={4} fill={stroke} stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>

      {hp && (
        <div className="pointer-events-none absolute left-3 top-2 rounded-lg border border-border bg-elevated/95 px-3 py-1.5 text-xs shadow-lg">
          <span className="tnum font-medium">{formatRate(hp.value)}</span>
          <span className="ml-2 text-muted">{formatAxisDate(hp.date, '1m')}</span>
        </div>
      )}

      {/* Announce the focused data point to screen readers */}
      <p className="sr-only" aria-live="polite">
        {hp ? `${formatRate(hp.value)} on ${formatAxisDate(hp.date, '1m')}` : ''}
      </p>
    </div>
  )
}

function pickXTicks(n: number, count: number): number[] {
  if (n === 0) return []
  if (n <= 2) return [0, n - 1].filter((v, i, a) => a.indexOf(v) === i)
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(Math.round((i / (count - 1)) * (n - 1)))
  return [...new Set(out)]
}
