// Our own legend (not Recharts'), so it wraps neatly on a phone and can include
// meanings like "Below target" that aren't a data series.
export default function ChartLegend({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 px-2 pb-1 text-[13px] text-ink-muted md:px-3">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className={`shrink-0 ${item.shape === 'line' ? 'h-0.5 w-3.5' : item.shape === 'dash' ? 'h-0 w-3.5 border-t-2 border-dashed' : item.shape === 'dot' ? 'size-2 rounded-full' : 'size-2.5 rounded-sm'}`}
            style={item.shape === 'dash' ? { borderColor: item.color } : { background: item.color }}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
