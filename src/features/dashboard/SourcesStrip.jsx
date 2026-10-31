import { Link } from 'react-router'

import Freshness from '../../components/ui/Freshness.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { DASHBOARD_SOURCES } from '../../data/dashboard.js'
import { isStale, usePipelines } from '../../state/AppStore.jsx'

/*
  The pipelines this dashboard depends on: status and freshness at a glance,
  one tap to open any of them.
    phone   a sideways-scrolling row (the next card peeks in to show there is more)
    iPad+   three columns
*/
export default function SourcesStrip() {
  const pipelines = usePipelines().filter((p) => DASHBOARD_SOURCES.includes(p.id))

  return (
    <section aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="mb-2 text-sm font-semibold">
        Data sources
      </h2>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
        {pipelines.map((p) => (
          <li key={p.id} className="w-[15.5rem] shrink-0 snap-start md:w-auto">
            <Link
              to={`/pipelines/${p.id}`}
              className={`flex h-full flex-col gap-2 rounded-2xl glass-card px-4 py-3.5 transition-transform duration-300 ease-out-ui active:scale-[0.98] pointer-fine:hover:-translate-y-0.5 ${
                p.status === 'failed' ? 'ring-1 ring-fail-dot/45' : ''
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{p.name}</span>
                <StatusBadge status={p.status} />
              </span>
              <Freshness at={p.lastSuccessAt} stale={isStale(p)} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
