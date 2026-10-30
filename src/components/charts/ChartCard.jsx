import { Workflow } from 'lucide-react'
import { Link } from 'react-router'

import { isStale } from '../../state/AppStore.jsx'
import Freshness from '../ui/Freshness.jsx'
import StaleWarning from './StaleWarning.jsx'

/*
  Frame for every chart in the app (dashboard tiles and chat answers).
  The footer always says where the data came from and how fresh it is,
  and links to the pipeline behind it. Trust is part of every chart.
*/
export default function ChartCard({
  title,
  description,
  pipeline,
  actions,
  children,
  headingLevel: Heading = 'h2',
  className = '',
}) {
  const stale = pipeline && isStale(pipeline)

  return (
    <section className={`flex min-w-0 flex-col rounded-xl border border-line bg-surface ${className}`}>
      <header className="flex items-start justify-between gap-3 px-4 pt-4 md:px-5 md:pt-5">
        <div className="min-w-0">
          <Heading className="text-[15px] font-semibold">{title}</Heading>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="-mt-1 -mr-1 flex shrink-0 items-center gap-1">{actions}</div>}
      </header>

      {stale && (
        <div className="px-4 pt-3 md:px-5">
          <StaleWarning pipeline={pipeline} compact />
        </div>
      )}

      <div className="min-w-0 flex-1 px-2 pt-3 pb-2 md:px-3">{children}</div>

      {pipeline && (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 md:px-5">
          <Link
            to={`/pipelines/${pipeline.id}`}
            className="-mx-1 inline-flex min-h-11 items-center gap-1.5 rounded px-1 text-[13px] font-medium text-ink-muted hover:text-ink pointer-fine:min-h-0"
          >
            <Workflow className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {pipeline.name} pipeline
          </Link>
          <Freshness at={pipeline.lastSuccessAt} stale={stale} />
        </footer>
      )}
    </section>
  )
}
