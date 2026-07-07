import type { SVGProps } from 'react'

/* Inline versions of the design's icons, recoloured to `currentColor` so they
 * can adapt to state (accent, muted, up/down). Paths are taken verbatim from
 * the provided assets in /assets/images. */

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base(size: number, viewBox: string, props: SVGProps<SVGSVGElement>) {
  return { width: size, height: size, viewBox, 'aria-hidden': true, focusable: false, ...props }
}

export function SearchIcon({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 14 20', p)} fill="none">
      <path
        fill="currentColor"
        d="M13.89 15.814c.137.137.137.355 0 .465l-.628.629c-.11.136-.328.136-.465 0l-3.309-3.309a.44.44 0 0 1-.082-.246v-.355a5.76 5.76 0 0 1-3.719 1.367A5.683 5.683 0 0 1 0 8.677C0 5.56 2.543 2.99 5.688 2.99c3.117 0 5.687 2.57 5.687 5.687a5.73 5.73 0 0 1-1.395 3.719h.356c.082 0 .164.055.246.11zm-8.202-2.762a4.37 4.37 0 0 0 4.375-4.375 4.39 4.39 0 0 0-4.376-4.375 4.37 4.37 0 0 0-4.374 4.375 4.353 4.353 0 0 0 4.375 4.375"
      />
    </svg>
  )
}

export function ChevronDownIcon({ size = 12, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 12 12', p)} fill="none">
      <path
        fill="currentColor"
        d="M2.988 4.02h6.024c.422 0 .633.515.328.82l-3 3a.48.48 0 0 1-.68 0l-3-3c-.304-.305-.093-.82.328-.82"
      />
    </svg>
  )
}

export function CheckIcon({ size = 12, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 12 12', p)} fill="none">
      <path
        fill="currentColor"
        d="M10.207 1.957c.117-.117.305-.117.398 0l.68.656c.094.117.094.305 0 .399l-7.031 7.031a.27.27 0 0 1-.399 0L.715 6.926c-.094-.117-.094-.305 0-.399l.68-.68c.093-.093.28-.093.398 0l2.25 2.274z"
      />
    </svg>
  )
}

/** Horizontal swap arrows. */
export function ExchangeIcon({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 20 20', p)} fill="none">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6 9 2 5l4-4M2 5h16m-4 6 4 4-4 4m4-4H2"
      />
    </svg>
  )
}

/** Vertical swap arrows (used for the converter swap button). */
export function ExchangeVerticalIcon({ size = 20, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 20 20', p)} fill="none">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m11 6 4-4 4 4m-4-4v16m-6-4-4 4-4-4m4 4V2"
      />
    </svg>
  )
}

export function StarIcon({ size = 16, filled = false, ...p }: IconProps & { filled?: boolean }) {
  if (filled) {
    return (
      <svg {...base(size, '0 0 16 16', p)} fill="none">
        <path
          fill="currentColor"
          d="M7.332 2.41c.281-.562 1.078-.538 1.336 0l1.547 3.118 3.422.492c.61.094.843.844.398 1.29l-2.46 2.413.585 3.399c.094.61-.562 1.078-1.101.797l-3.047-1.617-3.07 1.617c-.54.28-1.196-.188-1.102-.797l.586-3.399L1.965 7.31c-.446-.445-.211-1.195.398-1.289l3.446-.492z"
        />
      </svg>
    )
  }
  return (
    <svg {...base(size, '0 0 16 16', p)} fill="none">
      <path
        fill="currentColor"
        d="M13.637 6.02c.61.094.843.844.398 1.29l-2.46 2.413.585 3.399c.094.61-.562 1.078-1.101.797l-3.047-1.617-3.07 1.617c-.54.28-1.196-.188-1.102-.797l.586-3.399L1.965 7.31c-.446-.445-.211-1.195.398-1.289l3.446-.492 1.523-3.117c.281-.563 1.078-.54 1.336 0l1.547 3.117zm-3.282 3.305 2.368-2.297-3.258-.469-1.453-2.953L6.535 6.56l-3.258.469 2.367 2.297-.562 3.234 2.93-1.523 2.906 1.523z"
      />
    </svg>
  )
}

export function DeleteIcon({ size = 16, filled = false, ...p }: IconProps & { filled?: boolean }) {
  if (filled) {
    return (
      <svg {...base(size, '0 0 16 16', p)} fill="none">
        <path
          fill="currentColor"
          d="M12.875 2.75c.188 0 .375.188.375.375v.75c0 .21-.187.375-.375.375h-9.75a.37.37 0 0 1-.375-.375v-.75c0-.187.164-.375.375-.375h2.813l.21-.422c.07-.187.305-.328.493-.328h2.695c.187 0 .398.14.492.328l.235.422zM3.992 12.945 3.5 5h9l-.516 7.945c-.023.586-.539 1.055-1.125 1.055H5.117c-.586 0-1.101-.469-1.125-1.055"
        />
      </svg>
    )
  }
  return (
    <svg {...base(size, '0 0 16 16', p)} fill="none">
      <path
        fill="currentColor"
        d="M12.875 3.875c.188 0 .375.188.375.375v.375c0 .21-.187.375-.375.375H12.5l-.516 7.945c-.023.586-.539 1.055-1.125 1.055H5.117c-.586 0-1.101-.469-1.125-1.055L3.5 5h-.375a.37.37 0 0 1-.375-.375V4.25c0-.187.164-.375.375-.375h1.922l.797-1.312c.187-.305.61-.563.96-.563h2.368c.351 0 .773.258.96.563l.798 1.312zm-6.07-.75-.446.75h3.258l-.445-.75zm4.054 9.75L11.352 5H4.625l.492 7.875z"
      />
    </svg>
  )
}

export function ArrowRightIcon({ size = 11, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 11 11', p)} fill="none">
      <path
        fill="currentColor"
        d="M5.11.088c.093-.117.28-.117.398 0l4.898 4.898a.27.27 0 0 1 0 .399l-4.898 4.898c-.117.117-.305.117-.399 0l-.468-.445c-.118-.117-.118-.305 0-.399l3.632-3.656H.281A.27.27 0 0 1 0 5.502v-.656c0-.14.117-.282.281-.282h7.992L4.641.932c-.118-.094-.118-.282 0-.399z"
      />
    </svg>
  )
}

export function TriangleUpIcon({ size = 10, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 10 10', p)} fill="none">
      <path fill="currentColor" d="M5 1.5 9 8H1z" />
    </svg>
  )
}

export function TriangleDownIcon({ size = 10, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 10 10', p)} fill="none">
      <path fill="currentColor" d="M5 8.5 1 2h8z" />
    </svg>
  )
}

export function SunIcon({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 24 24', p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

export function MoonIcon({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size, '0 0 24 24', p)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79" />
    </svg>
  )
}
