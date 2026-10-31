import { ChevronLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'

import ChartCard from '../../components/charts/ChartCard.jsx'
import ChartPanel from '../../components/charts/ChartPanel.jsx'
import DataTable from '../../components/charts/DataTable.jsx'
import StaleWarning from '../../components/charts/StaleWarning.jsx'
import SegmentedControl from '../../components/ui/SegmentedControl.jsx'
import { DASHBOARD_NAME, regionDetail } from '../../data/dashboard.js'
import { getPeriod, getRegion } from '../../data/metrics.js'
import { PERIODS } from '../../data/sales.js'
import { useIsPhone } from '../../hooks/useMediaQuery.js'
import { isStale, useActions, usePipeline, useStore } from '../../state/AppStore.jsx'
import KpiStrip from './KpiStrip.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

const PERIOD_OPTIONS = PERIODS.map((p) => ({ value: p.id, label: p.id === 'ytd' ? 'YTD' : p.label.replace(' 2026', '') }))

// Drill-down from the dashboard: one region's numbers, its product categories and its stores.
export default function RegionScreen() {
  const { regionId } = useParams()
  const { filters } = useStore().state
  const { setFilter } = useActions()
  const sales = usePipeline('regional-sales')
  const isPhone = useIsPhone()
  useDocumentTitle(getRegion(regionId) ? `${getRegion(regionId).name} region` : null)

  if (!getRegion(regionId)) return <Navigate to="/dashboard" replace />
  const detail = regionDetail(filters, regionId)

  return (
    <>
      <header className="px-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-5 md:px-8 md:pt-6 xl:px-10">
        <Link
          to="/dashboard"
          className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg pr-3 pl-1 text-sm text-ink-muted hover:text-ink pointer-fine:min-h-8"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {DASHBOARD_NAME}
        </Link>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.015em] md:text-2xl">{detail.region.name} region</h1>
            <p className="mt-1 text-ink-muted">
              {getPeriod(filters.period).label}, {detail.region.stores.length} stores
            </p>
          </div>
          <SegmentedControl
            label="Date range"
            options={PERIOD_OPTIONS}
            value={filters.period}
            onChange={(v) => setFilter('period', v)}
          />
        </div>
      </header>

      <div className="space-y-6 px-4 pb-10 md:px-8 xl:px-10">
        {isStale(sales) && <StaleWarning pipeline={sales} affected="these numbers show" />}
        <KpiStrip period={filters.period} region={regionId} />

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartPanel chart={detail.categoryChart} staleNotice={false} />
          <ChartCard
            title="Revenue by store"
            description={`${getPeriod(filters.period).label}, ${detail.region.name}`}
            pipeline={sales}
            staleNotice={false}
          >
            <DataTable
              caption={`Revenue by store, ${detail.region.name}`}
              compact={isPhone}
              columns={[
                { key: 'name', label: 'Store' },
                { key: 'revenue', label: 'Revenue', format: 'currency' },
                { key: 'share', label: 'Share', format: 'percent' },
              ]}
              rows={detail.storeRows}
            />
          </ChartCard>
        </div>
      </div>
    </>
  )
}
