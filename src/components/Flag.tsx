import { flagUrl } from '../lib/flags'

interface FlagProps {
  code: string
  size?: number
  className?: string
}

/** Rounded flag chip. Falls back to the currency's first two letters when no
 *  flag asset exists (e.g. ILS). */
export function Flag({ code, size = 24, className = '' }: FlagProps) {
  const url = flagUrl(code)
  const style = { width: size, height: size }
  if (!url) {
    return (
      <span
        style={style}
        className={`inline-flex items-center justify-center rounded-full bg-surface-2 text-[0.5625rem] font-semibold text-muted ${className}`}
        aria-hidden
      >
        {code.slice(0, 2)}
      </span>
    )
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      width={size}
      height={size}
      style={style}
      className={`inline-block shrink-0 rounded-full object-cover ${className}`}
    />
  )
}
