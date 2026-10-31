import { Link, useNavigate } from 'react-router'

import ChartPanel from '../../components/charts/ChartPanel.jsx'
import StaleWarning from '../../components/charts/StaleWarning.jsx'
import PageHeader from '../../components/layout/PageHeader.jsx'
import {
  DASHBOARD_NAME,
  DASHBOARD_SOURCES,
  filterLabel,
  monthlyChart,
  regionChart,
  returnsChart,
  stockChart,
} from '../../data/dashboard.js'
import { REGIONS } from '../../data/sales.js'
import { usePipelines, useStore } from '../../state/AppStore.jsx'
import FilterBar from './FilterBar.jsx'
import KpiStrip from './KpiStrip.jsx'
import PinnedAnswers from './PinnedAnswers.jsx'
import SourcesStrip from './SourcesStrip.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

/*
  Reading order, top to bottom, is the same on every device:
    1. filters           what am I looking at
    2. stale warning     can I trust it (only when a source failed, said once)
    3. headline numbers
    4. data sources      the pipelines behind it, with status
    5. charts            phone: one column in priority order; iPad landscape and desktop: two columns
    6. pinned from chat
*/
export default function DashboardScreen() {
  useDocumentTitle(DASHBOARD_NAME)
  const { filters } = useStore().state
  const navigate = useNavigate()
  const failed = usePipelines().filter((p) => DASHBOARD_SOURCES.includes(p.id) && p.status === 'failed')
  const openRegion = (row) => navigate(`/dashboard/region/${row.id}`)

  return (
    <>
      <PageHeader title={DASHBOARD_NAME} description={`Halden Outfitters, ${filterLabel(filters)}`} />

      <div className="space-y-6 px-4 pb-10 md:px-8 xl:px-10">
        <FilterBar />

        {failed.map((p) => (
          <StaleWarning key={p.id} pipeline={p} affected="revenue, orders and order value show" />
        ))}

        <KpiStrip period={filters.period} region={filters.region} />
        <SourcesStrip />

        <section aria-label="Charts" className="grid gap-4 lg:grid-cols-2">
          <ChartPanel
            chart={regionChart(filters)}
            onSelect={openRegion}
            staleNotice={false}
            footer={<DrillDownLinks />}
          />
          <ChartPanel chart={monthlyChart(filters)} staleNotice={false} />
          <ChartPanel chart={returnsChart(filters)} />
          <ChartPanel chart={stockChart()} />
        </section>

        <PinnedAnswers />
      </div>
    </>
  )
}

// The chart's columns are tappable, but a visible list is clearer, works with a
// keyboard, and gives every region a full-size touch target.
function DrillDownLinks() {
  return (
    <nav aria-label="Open a region" className="flex flex-wrap items-center gap-x-1 gap-y-1 px-4 pb-3 md:px-5">
      <span className="mr-1 text-[13px] text-ink-muted">Open a region</span>
      {REGIONS.map((r) => (
        <Link
          key={r.id}
          to={`/dashboard/region/${r.id}`}
          className="inline-flex min-h-11 items-center rounded-lg px-2 text-[13px] font-semibold text-tint-text transition-colors hover:bg-tint-soft pointer-fine:min-h-8"
        >
          {r.name}
        </Link>
      ))}
    </nav>
  )
}
