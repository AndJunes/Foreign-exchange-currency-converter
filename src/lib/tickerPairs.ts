/** Currency pairs shown in the live markets ticker, in display order.
 *  Kept out of the Ticker component so the list is discoverable and
 *  reusable (tests, docs, future server-side rendering). */
export const TICKER_PAIRS: [string, string][] = [
  ['USD', 'EUR'], ['EUR', 'USD'], ['USD', 'GBP'], ['GBP', 'USD'],
  ['USD', 'JPY'], ['EUR', 'JPY'], ['EUR', 'GBP'], ['AUD', 'USD'],
  ['USD', 'CAD'], ['USD', 'CHF'], ['NZD', 'USD'], ['USD', 'CNY'],
  ['USD', 'MXN'], ['USD', 'SEK'], ['USD', 'SGD'], ['USD', 'INR'],
]
