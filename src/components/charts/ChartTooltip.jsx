import { formatValue } from './chartTheme.js'

/*
  Recharts calls this with the hovered (mouse) or tapped (touch) point.
  Tooltips are a convenience only: the same numbers are always available
  through "View as table", so nothing depends on hover.
*/
export default function ChartTooltip({ active, payload, label, format, extra }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload

  return (
    <div className="min-w-40 rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] shadow-[0_6px_20px_rgb(22_32_42/0.12)]">
      <p className="mb-1.5 font-semibold">{label}</p>
      <ul className="space-y-1">
        {payload.map((item) => (
          <li key={item.dataKey} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: item.color }} aria-hidden="true" />
            <span className="text-ink-muted">{item.name}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums">{formatValue(item.value, format)}</span>
          </li>
        ))}
      </ul>
      {extra && <p className="mt-1.5 border-t border-line pt-1.5 text-ink-muted">{extra(row)}</p>}
    </div>
  )
}
