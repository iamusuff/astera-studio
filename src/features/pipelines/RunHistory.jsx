import { StatusIcon } from '../../components/ui/StatusBadge.jsx'
import { useNow } from '../../hooks/useNow.js'
import { formatDuration, formatExact, formatRelative } from '../../lib/format.js'

// The last five runs: when, who or what started it, how it ended, how long it took.
export default function RunHistory({ pipeline }) {
  useNow()
  return (
    <section aria-labelledby="runs-heading" className="rounded-[var(--radius-group)] bg-surface shadow-[var(--shadow-card)]">
      <h2 id="runs-heading" className="px-4 pt-4 pb-2 text-sm font-semibold">
        Recent runs
      </h2>
      <ol className="divide-y divide-line">
        {pipeline.runs.slice(0, 5).map((run) => (
          <li key={run.id + run.startedAt} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <StatusIcon status={run.status} />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{run.by ? `Re-run by ${run.by}` : 'Scheduled run'}</span>
              <time dateTime={run.startedAt} title={formatExact(run.startedAt)} className="text-[13px] text-ink-muted">
                {formatRelative(run.startedAt)}
              </time>
            </span>
            <span className="shrink-0 text-[13px] text-ink-muted tabular-nums">
              {run.finishedAt
                ? formatDuration(new Date(run.finishedAt) - new Date(run.startedAt))
                : 'Running…'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
