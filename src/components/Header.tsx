import type { Theme } from '../types'
import { MoonIcon, SunIcon } from './Icons'

interface HeaderProps {
  currencyCount: number | null
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ currencyCount, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="flex items-center gap-4">
        <img src="/assets/images/logo.svg" alt="FX Checker" width={139} height={26} className="h-6 w-auto" />
      </h1>
      <div className="flex items-center gap-3">
        <p className="text-right text-[0.625rem] uppercase leading-[1.2] tracking-[0.0714em] text-muted sm:text-left sm:text-sm">
          <span className="tnum">{currencyCount ?? '—'}</span> Currencies · EOD · ECB data
        </p>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition-all hover:border-border-strong hover:text-text active:scale-95"
        >
          {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
      </div>
    </header>
  )
}
