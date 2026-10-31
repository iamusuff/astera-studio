import { formatCurrency, formatCurrencyCompact, formatPercent } from '../../lib/format.js'

import { useTheme } from '../../state/theme.jsx'

// SVG chart parts need real color values, one set per appearance. They mirror
// the tokens in styles/index.css; keep both in sync. Bars use Apple's bright
// status colors (graphics need 3:1 contrast, text needs 4.5:1).
export const CHART_COLORS = {
  light: {
    series: '#0071e3',
    seriesMuted: '#d1d1d6',
    fail: '#ff3b30',
    run: '#5856d6',
    warn: '#b25000',
    waiting: '#c7c7cc',
    ink: '#1d1d1f',
    inkMuted: '#636366',
    inkFaint: '#aeaeb2',
    line: '#e5e5ea',
    sunken: '#f2f2f7',
    surface: '#ffffff',
  },
  dark: {
    series: '#0a84ff',
    seriesMuted: '#48484a',
    fail: '#ff453a',
    run: '#7d7aff',
    warn: '#ffb340',
    waiting: '#48484a',
    ink: '#f5f5f7',
    inkMuted: '#98989d',
    inkFaint: '#636366',
    line: '#38383a',
    sunken: '#2c2c2e',
    surface: '#1c1c1e',
  },
}

export const useChartColors = () => CHART_COLORS[useTheme()?.theme ?? 'light']

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

export const axisProps = (C) => ({
  tickLine: false,
  tick: { fontSize: 12, fill: C.inkMuted },
})
