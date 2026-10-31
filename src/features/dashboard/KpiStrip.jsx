import { TriangleAlert } from 'lucide-react'

import { getKpis } from '../../data/metrics.js'
import { formatCurrency, formatCurrencyCompact, formatNumber, formatPercent } from '../../lib/format.js'
import { isStale, usePipeline } from '../../state/AppStore.jsx'

/*
  Four headline numbers in one panel, separated by hairlines rather than four
  separate cards. Layout per device:
    phone    revenue across the full width, the other three in a row beneath
    iPad+    all four in one row
  Numbers fed by a failed pipeline carry a small warning, said in words for screen readers.
*/
export default function KpiStrip({ period, region }) {
  const k = getKpis(period, region)
  const sales = usePipeline('regional-sales')
  const returns = usePipeline('customer-returns')
  const prev = k.previous
  const vs = k.previousLabel ? ` vs ${k.previousLabel.replace(' 2026', '')}` : ''
  const change = (now, before) => (before ? formatPercent(now / before - 1, { signed: true }) + vs : null)
  const belowTarget = k.attainment < 1

  const tiles = [
    {
      label: 'Revenue',
      value: formatCurrencyCompact(k.revenue),
      exact: formatCurrency(k.revenue),
      note: (
        <span className={belowTarget ? 'text-fail' : ''}>
          {formatPercent(k.attainment)} of {formatCurrencyCompact(k.target)} target
        </span>
      ),
      change: prev && change(k.revenue, prev.revenue),
      stale: isStale(sales),
      primary: true,
    },
    { label: 'Orders', value: formatNumber(k.orders), change: prev && change(k.orders, prev.orders), stale: isStale(sales) },
    {
      label: 'Avg order',
      value: `$${k.avgOrderValue.toFixed(2)}`,
      change: prev && change(k.avgOrderValue, prev.avgOrderValue),
      stale: isStale(sales),
    },
    {
      label: 'Return rate',
      value: formatPercent(k.returnRate),
      change: prev && `${formatPoints(k.returnRate - prev.returnRate)}${vs}`,
      stale: isStale(returns),
    },
  ]

  return (
    <dl className="grid grid-cols-3 overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] md:grid-cols-4">
      {tiles.map((t, i) => (
        <div
          key={t.label}
          className={`flex min-w-0 flex-col gap-1 px-3 py-3 md:px-5 md:py-4 ${
            t.primary ? 'col-span-3 border-b border-line px-4 md:col-span-1 md:border-b-0' : ''
          } ${i > 1 ? 'border-l border-line' : ''} ${i === 1 ? 'md:border-l md:border-line' : ''}`}
        >
          <dt className="flex items-center gap-1.5 text-[13px] text-ink-muted">
            {t.label}
            {t.stale && (
              <>
                <TriangleAlert className="size-3.5 text-warn" strokeWidth={2} aria-hidden="true" />
                <span className="sr-only">(may be out of date)</span>
              </>
            )}
          </dt>
          <dd
            className={`font-semibold tracking-[-0.01em] tabular-nums ${t.primary ? 'text-[34px] leading-tight tracking-[-0.025em] md:text-[30px]' : 'text-xl md:text-[30px] md:tracking-[-0.025em]'}`}
            title={t.exact}
          >
            {t.value}
          </dd>
          {t.note && <dd className="text-[13px]">{t.note}</dd>}
          {t.change && <dd className="text-xs text-ink-muted md:text-[13px]">{t.change}</dd>}
        </div>
      ))}
    </dl>
  )
}

function formatPoints(diff) {
  const pts = (diff * 100).toFixed(1)
  return `${diff >= 0 ? '+' : '−'}${Math.abs(pts)} pts`
}
