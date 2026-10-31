import { Wrench } from 'lucide-react'
import { useState } from 'react'

import Button from '../../components/ui/Button.jsx'
import { notify } from '../../components/ui/notify.jsx'
import { formatCurrency, formatNumber } from '../../lib/format.js'
import { useActions } from '../../state/AppStore.jsx'

/*
  A failed step, explained for a business user, with a suggested fix.

  Governed like Astera's own AI: Studio proposes, a person previews and approves,
  and only a re-run actually changes the data. Approving can be undone; the
  technical error is one tap away for anyone who wants it.
*/
export default function FixSuggestion({ pipeline, step }) {
  const { applyFix, undo, rerun } = useActions()
  const [previewing, setPreviewing] = useState(false)
  const { error, suggestion } = step
  const { preview } = suggestion

  function approve() {
    const undoId = applyFix(pipeline.id, step.id)
    notify({
      title: 'Fix approved',
      success: true,
      description: 'Re-run this step to refresh the data.',
      secondary: { label: 'Re-run now', onClick: () => rerun(pipeline.id, step.id) },
      action: { label: 'Undo', onClick: () => undo(undoId) },
      duration: 8000,
    })
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">What happened</h3>
        <p className="leading-relaxed">{error.explanation}</p>
        <details className="group text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-ink-muted hover:text-ink pointer-fine:min-h-0">
            Technical details
          </summary>
          <p className="mt-1 rounded-lg bg-sunken px-3 py-2 text-[13px] break-words text-ink">{error.technical}</p>
        </details>
      </section>

      <section className="rounded-2xl bg-paper p-4">
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Wrench className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Suggested fix
        </p>
        <h3 className="mt-1.5 font-semibold">{suggestion.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{suggestion.explanation}</p>

        {previewing && (
          <div className="mt-4 space-y-3" id={`${step.id}-fix-preview`}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-sunken px-3 py-2">
                <dt className="text-ink-muted">Orders matched now</dt>
                <dd className="text-lg font-semibold text-fail tabular-nums">{formatNumber(preview.matchedBefore)}</dd>
              </div>
              <div className="rounded-lg bg-sunken px-3 py-2">
                <dt className="text-ink-muted">After the fix</dt>
                <dd className="text-lg font-semibold tabular-nums">{formatNumber(preview.matchedAfter)}</dd>
              </div>
            </dl>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <caption className="pb-1.5 text-left text-[13px] text-ink-muted">Sample of matched rows</caption>
                <thead>
                  <tr className="border-b border-line text-left text-[13px] text-ink-muted">
                    <th className="py-1.5 pr-3 font-medium">Region</th>
                    <th className="py-1.5 pr-3 font-medium">Month</th>
                    <th className="py-1.5 pr-3 text-right font-medium">Revenue</th>
                    <th className="py-1.5 text-right font-medium">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.map((row) => (
                    <tr key={row.region + row.month} className="border-b border-line last:border-0">
                      <td className="py-1.5 pr-3">{row.region}</td>
                      <td className="py-1.5 pr-3">{row.month}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{formatCurrency(row.revenue)}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatCurrency(row.target)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" onClick={approve}>
            Approve fix
          </Button>
          <Button
            variant="secondary"
            aria-expanded={previewing}
            aria-controls={`${step.id}-fix-preview`}
            onClick={() => setPreviewing(!previewing)}
          >
            {previewing ? 'Hide preview' : 'Preview the result'}
          </Button>
        </div>
      </section>
    </div>
  )
}
