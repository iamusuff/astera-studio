import { now } from './clock.js'

// All number and date formatting lives here so every screen says things the same way.

const currencyFull = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const number = new Intl.NumberFormat('en-US')
const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const dayTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export const formatCurrency = (value) => currencyFull.format(value)
// Short money for summaries, axes and KPIs. Fixed decimals so numbers side by side
// read the same way: $4.18M, $2.60M, $973.6K, $840
export function formatCurrencyCompact(value) {
  const sign = value < 0 ? '−' : ''
  const abs = Math.abs(value)
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`
  return `${sign}$${Math.round(abs)}`
}
export const formatNumber = (value) => number.format(value)

// Row counts on the narrow connectors of the desktop pipeline diagram: 638.9K, 195.4K, 15
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
export const formatCompactNumber = (value) => compactNumber.format(value)

// 0.0412 -> "4.1%"; signed adds a + for growth
export function formatPercent(ratio, { signed = false, digits = 1 } = {}) {
  const text = `${(Math.abs(ratio) * 100).toFixed(digits)}%`
  if (!signed) return ratio < 0 ? `−${text}` : text
  if (Math.abs(ratio) < 0.0005) return text
  return ratio > 0 ? `+${text}` : `−${text}` // true minus sign, lines up with +
}

export function formatDuration(ms) {
  if (ms < 1000) return '<1s'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return s % 60 ? `${m}m ${s % 60}s` : `${m}m`
}

// "just now", "4 min ago", "3h ago", "yesterday, 6:02 PM", "Oct 28, 6:00 AM"
export function formatRelative(iso) {
  const date = new Date(iso)
  const diff = now() - date
  const future = diff < 0
  const mins = Math.round(Math.abs(diff) / 60000)

  if (mins < 1) return 'just now'
  if (mins < 60) return future ? `in ${mins} min` : `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 12) return future ? `in ${hours}h` : `${hours}h ago`

  const today = now()
  const sameDay = (a, b) => a.toDateString() === b.toDateString()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (sameDay(date, today)) return `today, ${time.format(date)}`
  if (sameDay(date, yesterday)) return `yesterday, ${time.format(date)}`
  if (sameDay(date, tomorrow)) return `tomorrow, ${time.format(date)}`
  return dayTime.format(date)
}

// Exact timestamp for tooltips and <time> titles: "Oct 31, 6:04 AM"
export const formatExact = (iso) => dayTime.format(new Date(iso))
export const formatClock = (iso) => time.format(new Date(iso))
