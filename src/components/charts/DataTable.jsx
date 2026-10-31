import { formatValue } from './chartTheme.js'

/*
  The table version of a chart: exact numbers, readable by screen readers,
  and the honest fallback when a chart is too small to read on a phone.
  Wide tables scroll sideways inside their own box, never the whole page.
*/
// compact: short money ($4.18M) so four columns fit a 375px phone without scrolling.
export default function DataTable({ columns, rows, caption, flagKey, compact = false }) {
  const fmt = (format) => (compact && format === 'currency' ? 'currency-compact' : format)
  return (
    <div className="overflow-x-auto px-2 md:px-3">
      <table className="w-full min-w-[300px] text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line text-left text-[13px] text-ink-muted">
            {columns.map((col, i) => (
              <th key={col.key} scope="col" className={`py-2 font-medium ${i === 0 ? 'pr-3' : 'px-3 text-right'}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {columns.map((col, i) =>
                i === 0 ? (
                  <th key={col.key} scope="row" className="py-2.5 pr-3 text-left font-medium">
                    {row[col.key]}
                    {flagKey && row[flagKey] && (
                      <span className="block text-[13px] font-normal text-fail">{compact ? 'Missed' : 'Below target'}</span>
                    )}
                  </th>
                ) : (
                  <td key={col.key} className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                    {formatValue(row[col.key], fmt(col.format))}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
