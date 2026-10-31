import { Navigate, useParams } from 'react-router'

import ChartCard from '../../components/charts/ChartCard.jsx'
import ChartPanel from '../../components/charts/ChartPanel.jsx'
import DataTable from '../../components/charts/DataTable.jsx'
import PageHeader from '../../components/layout/PageHeader.jsx'
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
      <PageHeader
        title={`${detail.region.name} region`}
        description={`${getPeriod(filters.period).label}, ${detail.region.stores.length} stores`}
        back={{ to: '/dashboard', label: DASHBOARD_NAME }}
        actions={
          <SegmentedControl
            label="Date range"
            options={PERIOD_OPTIONS}
            value={filters.period}
            onChange={(v) => setFilter('period', v)}
          />
        }
      />

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
