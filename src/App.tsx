import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import type { CurrencyCode, FavoritePair, LogEntry, RangeKey, TabKey, Theme } from './types'
import { useCurrencies, useMarket } from './hooks/useMarketData'
import { useLocalStorage } from './hooks/useLocalStorage'
import { convert, crossRate } from './lib/rates'
import { parseAmount } from './lib/format'
import { Header } from './components/Header'
import { Ticker } from './components/Ticker'
import { Converter } from './components/Converter'
import { Tabs } from './components/Tabs'
import { HistoryPanel } from './components/HistoryPanel'
import { ComparePanel } from './components/ComparePanel'
import { FavoritesPanel } from './components/FavoritesPanel'
import { LogPanel } from './components/LogPanel'

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

/** Pair from the URL (?from=USD&to=EUR) takes precedence over stored state. */
function pairFromUrl(): { from?: string; to?: string } {
  const p = new URLSearchParams(window.location.search)
  return { from: p.get('from') ?? undefined, to: p.get('to') ?? undefined }
}

export default function App() {
  const { data: currencies } = useCurrencies()
  const { data: market, error: marketError, refresh } = useMarket('USD')

  const urlPair = useMemo(pairFromUrl, [])
  const [from, setFrom] = useLocalStorage<CurrencyCode>('fx.from', urlPair.from ?? 'USD')
  const [to, setTo] = useLocalStorage<CurrencyCode>('fx.to', urlPair.to ?? 'EUR')
  const [amount, setAmount] = useLocalStorage<string>('fx.amount', '1000')
  const [tab, setTab] = useLocalStorage<TabKey>('fx.tab', 'history')
  const [range, setRange] = useLocalStorage<RangeKey>('fx.range', '1m')
  const [favorites, setFavorites] = useLocalStorage<FavoritePair[]>('fx.favorites', [])
  const [log, setLog] = useLocalStorage<LogEntry[]>('fx.log', [])
  const [theme, setTheme] = useLocalStorage<Theme>('fx.theme', 'dark')

  const [announcement, setAnnouncement] = useState('')

  // Apply theme.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Keep the URL in sync with the active pair (shareable / bookmarkable).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    p.set('from', from)
    p.set('to', to)
    window.history.replaceState(null, '', `?${p.toString()}`)
  }, [from, to])

  // ---- favorites ----
  const isFavorite = useCallback(
    (f: CurrencyCode, t: CurrencyCode) => favorites.some((p) => p.from === f && p.to === t),
    [favorites],
  )

  const toggleFavorite = useCallback(
    (f: CurrencyCode, t: CurrencyCode) => {
      setFavorites((prev) => {
        const exists = prev.some((p) => p.from === f && p.to === t)
        if (exists) {
          setAnnouncement(`Unpinned ${f} to ${t}`)
          return prev.filter((p) => !(p.from === f && p.to === t))
        }
        setAnnouncement(`Pinned ${f} to ${t}`)
        return [...prev, { from: f, to: t }]
      })
    },
    [setFavorites],
  )

  // ---- log ----
  const logConversion = useCallback(() => {
    const amt = parseAmount(amount)
    if (!market || !Number.isFinite(amt) || amt <= 0) return
    const rate = crossRate(market.latest, from, to)
    const result = convert(market.latest, from, to, amt)
    if (!Number.isFinite(result)) return
    const entry: LogEntry = { id: makeId(), from, to, amount: amt, result, rate, at: Date.now() }
    setLog((prev) => [entry, ...prev].slice(0, 100))
    setAnnouncement(`Logged ${amt} ${from} to ${to}`)
  }, [amount, market, from, to, setLog])

  const deleteLog = useCallback((id: string) => setLog((prev) => prev.filter((e) => e.id !== id)), [setLog])
  const clearLog = useCallback(() => {
    setLog([])
    setAnnouncement('Cleared the conversion log')
  }, [setLog])

  const swap = useCallback(() => {
    setFrom(to)
    setTo(from)
  }, [from, to, setFrom, setTo])

  const selectPair = useCallback(
    (f: CurrencyCode, t: CurrencyCode) => {
      setFrom(f)
      setTo(t)
      setTab('history')
    },
    [setFrom, setTo, setTab],
  )

  const tabs = useMemo(
    () => [
      { key: 'history' as const, label: 'History' },
      { key: 'compare' as const, label: 'Compare' },
      { key: 'favorites' as const, label: 'Favorites', badge: favorites.length },
      { key: 'log' as const, label: 'Log', badge: log.length },
    ],
    [favorites.length, log.length],
  )

  const panelId = useId()
  const currencyList = currencies ?? []

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-5">
        <Header
          currencyCount={currencies?.length ?? null}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      </div>

      {/* Full-bleed markets ticker — spans the entire viewport width */}
      <Ticker market={market} />

      {/* 1036px content column + 32px side padding */}
      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-8 px-4 pb-8 pt-6 sm:px-8 sm:pt-8">
      {marketError && !market && (
        <div className="flex items-center justify-between rounded-xl border border-neg/30 bg-neg-dim px-4 py-3 text-sm">
          <span>Couldn't reach the rates service.</span>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-border px-3 py-1 font-medium hover:border-border-strong"
          >
            Retry
          </button>
        </div>
      )}

      <Converter
        currencies={currencyList}
        market={market}
        from={from}
        to={to}
        amount={amount}
        isFavorite={isFavorite(from, to)}
        onAmountChange={setAmount}
        onFromChange={setFrom}
        onToChange={setTo}
        onSwap={swap}
        onToggleFavorite={() => toggleFavorite(from, to)}
        onLog={logConversion}
      />

      <section className="flex flex-col gap-5">
        <Tabs tabs={tabs} active={tab} onChange={setTab} panelId={panelId} />

        <div id={panelId} role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab} className="animate-fade-up">
          {tab === 'history' && (
            <HistoryPanel from={from} to={to} range={range} onRangeChange={setRange} />
          )}
          {tab === 'compare' && (
            <ComparePanel
              currencies={currencyList}
              market={market}
              base={from}
              amount={amount}
              isPinned={isFavorite}
              onTogglePin={toggleFavorite}
            />
          )}
          {tab === 'favorites' && (
            <FavoritesPanel
              favorites={favorites}
              market={market}
              onSelect={selectPair}
              onUnpin={toggleFavorite}
            />
          )}
          {tab === 'log' && <LogPanel entries={log} onClear={clearLog} onDelete={deleteLog} />}
        </div>
      </section>

        <footer className="mt-auto pt-2 text-center text-xs text-faint">
          Rates by the European Central Bank via Frankfurter · EOD data
        </footer>
      </main>

      {/* Screen-reader announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}
