import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import PageHeader from '../../components/layout/PageHeader.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { useNow } from '../../hooks/useNow.js'
import { formatExact, formatRelative } from '../../lib/format.js'
import { usePipelines } from '../../state/AppStore.jsx'

// Problems first: failed, then running, then the rest.
const ORDER = { failed: 0, running: 1, succeeded: 2, scheduled: 3 }

/*
  All pipelines. On desktop each row reads like a table (name, status, last
  run, next run, what it feeds); on phones the same rows stack into two lines.
*/
export default function PipelinesScreen() {
  useNow()
  const pipelines = [...usePipelines()].sort((a, b) => ORDER[a.status] - ORDER[b.status])
  const failed = pipelines.filter((p) => p.status === 'failed').length

  return (
    <>
      <PageHeader
        title="Pipelines"
        description={
          failed
            ? `${failed} of ${pipelines.length} need${failed === 1 ? 's' : ''} attention.`
            : `All ${pipelines.length} pipelines are healthy.`
        }
      />
      <div className="px-4 pb-10 md:px-8 xl:px-10">
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div
            className="hidden grid-cols-[minmax(0,2.2fr)_8rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_1.25rem] gap-4 border-b border-line px-5 py-2.5 text-[13px] text-ink-muted lg:grid"
            aria-hidden="true"
          >
            <span>Pipeline</span>
            <span>Status</span>
            <span>Last run</span>
            <span>Next run</span>
            <span>Feeds</span>
          </div>
          <ul className="divide-y divide-line">
            {pipelines.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/pipelines/${p.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-sunken/50 md:px-5 lg:grid-cols-[minmax(0,2.2fr)_8rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_1.25rem]"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{p.name}</span>
                    <span className="hidden truncate text-sm text-ink-muted md:block">{p.description}</span>
                  </span>
                  <span className="justify-self-end lg:justify-self-start">
                    <StatusBadge status={p.status} />
                  </span>
                  <span className="text-sm text-ink-muted lg:text-ink">
                    <span className="lg:hidden">Last run </span>
                    <time dateTime={p.lastRun.startedAt} title={formatExact(p.lastRun.startedAt)}>
                      {formatRelative(p.lastRun.startedAt)}
                    </time>
                  </span>
                  <span className="hidden text-sm lg:block">{formatRelative(p.nextRunAt)}</span>
                  <span className="hidden truncate text-sm text-ink-muted lg:block">{p.feeds.join(', ')}</span>
                  <ChevronRight className="hidden size-4 text-ink-faint lg:block" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
