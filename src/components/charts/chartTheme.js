import { formatCurrency, formatCurrencyCompact, formatPercent } from '../../lib/format.js'

// SVG chart parts need real color values. These mirror the tokens in
// styles/index.css; keep both in sync.
export const C = {
  series: '#3b5266',
  seriesMuted: '#b7c1ca',
  fail: '#b83228',
  ink: '#16202a',
  inkMuted: '#56626e',
  inkFaint: '#8b959f',
  line: '#dde2e6',
  sunken: '#eceff1',
}

// Axis labels are shorter than prose: $1.2M, $800K, 90%
export function axisTick(format) {
  if (format === 'percent') return (v) => `${+(v * 100).toFixed(1)}%`
  if (format === 'weeks') return (v) => `${v} wk`
  return (v) => {
    if (Math.abs(v) >= 1e6) return `$${+(v / 1e6).toFixed(1)}M`
    if (Math.abs(v) >= 1e3) return `$${Math.round(v / 1e3)}K`
    return `$${v}`
  }
}

// Values inside tooltips and tables: exact money, one-decimal percentages.
export function formatValue(value, format) {
  switch (format) {
    case 'percent':
      return formatPercent(value)
    case 'currency-signed':
      return `${value >= 0 ? '+' : '−'}${formatCurrency(Math.abs(value))}`
    case 'points': {
      const pts = (value * 100).toFixed(1)
      return `${value >= 0 ? '+' : '−'}${Math.abs(pts)} pts`
    }
    case 'weeks':
      return `${value.toFixed(1)} weeks`
    case 'currency-compact':
      return formatCurrencyCompact(value)
    case 'currency':
      return formatCurrency(value)
    default:
      return value
  }
}

// Round axis steps for small percentages (2.5%, 5%, 7.5%...) instead of 3.5%, 7%, 10.5%.
export function percentTicks(max) {
  const step = [0.01, 0.02, 0.025, 0.05, 0.1, 0.25].find((s) => max / s <= 5) ?? 0.5
  const top = Math.ceil(max / step) * step
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(4))
}

export const axisProps = {
  tickLine: false,
  tick: { fontSize: 12, fill: C.inkMuted },
}
