import { TriangleAlert } from 'lucide-react'

import { useNow } from '../../hooks/useNow.js'
import { formatClock, formatRelative } from '../../lib/format.js'
import { ButtonLink } from '../ui/Button.jsx'

/*
  Shown on any chart whose pipeline's latest run failed. It says what is wrong
  in plain words (the chart is showing older data), why (which pipeline failed,
  when), and gives one way forward (review the suggested fix).
*/
// affected: what to distrust, with its verb: "this chart shows", "revenue and orders show".
export default function StaleWarning({ pipeline, compact = false, affected = 'this chart shows' }) {
  useNow()
  const failedStep = pipeline.steps.find((s) => s.status === 'failed')
  const to = `/pipelines/${pipeline.id}${failedStep ? `?step=${failedStep.id}` : ''}`

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg border border-warn/25 bg-warn-soft px-3.5 py-3 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 gap-2.5">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" strokeWidth={2} aria-hidden="true" />
        <p className="text-sm text-ink">
          <span className="font-medium">Data may be out of date.</span>{' '}
          {compact ? (
            <>{pipeline.name} failed at {formatClock(pipeline.lastRun.finishedAt)}.</>
          ) : (
            <>
              {pipeline.name} failed at {formatClock(pipeline.lastRun.finishedAt)}, so {affected} data from{' '}
              {formatRelative(pipeline.lastSuccessAt)}.
            </>
          )}
        </p>
      </div>
      <ButtonLink to={to} variant="secondary" size="sm" className="self-start sm:self-auto">
        Review fix
      </ButtonLink>
    </div>
  )
}
