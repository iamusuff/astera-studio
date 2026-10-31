import { getMonthlySeries, getPeriod, getRegion, getRegionBreakdown, getRegionRows, getReturnRates } from './metrics.js'
import { REGIONS, STOCK_COVER } from './sales.js'

/*
  The "Sales overview" dashboard: which charts it has, which pipeline feeds each
  one, and how the date and region filters change them.
  Each function returns a chart spec (see components/charts/ChartView.jsx).
*/

export const DASHBOARD_NAME = 'Sales overview'

// The pipelines this dashboard depends on, in the order shown in "Data sources".
export const DASHBOARD_SOURCES = ['regional-sales', 'inventory-levels', 'customer-returns']

export const REGION_OPTIONS = [{ value: 'all', label: 'All regions' }, ...REGIONS.map((r) => ({ value: r.id, label: r.name }))]

export function filterLabel({ period, region }) {
  const regionLabel = region === 'all' ? 'all regions' : getRegion(region).name
  return `${getPeriod(period).label}, ${regionLabel}`
}

/** Revenue vs target by region. A selected region stays in context; the others fade. */
export function regionChart({ period, region }) {
  const rows = getRegionRows(period)
  return {
    id: 'region-revenue',
    title: 'Revenue vs target by region',
    subtitle: getPeriod(period).label,
    pipelineId: 'regional-sales',
    spec: {
      kind: 'bar-vs-target',
      format: 'currency',
      rows: rows.map((r) => ({
        id: r.id,
        label: r.name,
        value: r.revenue,
        target: r.target,
        flagged: r.missed,
        dimmed: region !== 'all' && r.id !== region,
      })),
      valueLabel: 'Revenue',
      flaggedLabel: 'Below target',
    },
    table: {
      columns: [
        { key: 'name', label: 'Region' },
        { key: 'revenue', label: 'Revenue', format: 'currency' },
        { key: 'target', label: 'Target', format: 'currency' },
        { key: 'attainment', label: 'Of target', format: 'percent' },
      ],
      rows,
      flagKey: 'missed',
    },
  }
}

export function monthlyChart({ period, region }) {
  const series = getMonthlySeries(period, region)
  return {
    id: 'monthly-revenue',
    title: 'Revenue by month',
    subtitle: filterLabel({ period, region }).replace(/^./, (c) => c.toUpperCase()),
    pipelineId: 'regional-sales',
    spec: {
      kind: 'line-vs-target',
      format: 'currency',
      rows: series.map((m) => ({ label: m.month, value: m.revenue, target: m.target })),
      valueLabel: 'Revenue',
      targetLabel: 'Monthly target',
    },
    table: {
      columns: [
        { key: 'month', label: 'Month' },
        { key: 'revenue', label: 'Revenue', format: 'currency' },
        { key: 'target', label: 'Target', format: 'currency' },
      ],
      rows: series,
    },
  }
}

export function returnsChart({ period, region }) {
  const rows = getReturnRates(period)
  return {
    id: 'return-rate',
    title: 'Return rate by region',
    subtitle: getPeriod(period).label,
    pipelineId: 'customer-returns',
    spec: {
      kind: 'bars',
      format: 'percent',
      rows: rows.map((r) => ({
        id: r.id,
        label: r.name,
        value: r.returnRate,
        dimmed: region !== 'all' && r.id !== region,
      })),
      valueLabel: 'Orders returned',
    },
    table: {
      columns: [
        { key: 'name', label: 'Region' },
        { key: 'returnRate', label: 'Returned', format: 'percent' },
      ],
      rows,
    },
  }
}

// Stock is a live snapshot, so the date filter doesn't apply. The subtitle says so.
export function stockChart() {
  return {
    id: 'stock-cover',
    title: 'Weeks of stock cover',
    subtitle: 'Current stock, all regions',
    pipelineId: 'inventory-levels',
    spec: {
      kind: 'bars',
      format: 'weeks',
      rows: STOCK_COVER.map((s) => ({ label: s.category, value: s.weeks, flagged: s.weeks < 4 })),
      valueLabel: 'Weeks of cover',
      flaggedLabel: 'Under 4 weeks: may run out',
      reference: 4,
      referenceLabel: '4-week minimum',
    },
    table: {
      columns: [
        { key: 'category', label: 'Category' },
        { key: 'weeks', label: 'Weeks of cover', format: 'weeks' },
      ],
      rows: STOCK_COVER.map((s) => ({ ...s, risk: s.weeks < 4 })),
      flagKey: 'risk',
      flagLabel: 'May run out',
    },
  }
}

/** Drill-down: one region's revenue by product category and by store. */
export function regionDetail({ period }, regionId) {
  const detail = getRegionBreakdown(period, regionId)
  return {
    ...detail,
    categoryChart: {
      id: 'region-categories',
      title: 'Revenue by product category',
      subtitle: `${getPeriod(period).label}, ${detail.region.name}`,
      pipelineId: 'regional-sales',
      spec: {
        kind: 'bars',
        format: 'currency',
        rows: detail.categories.map((c) => ({ label: c.name, value: c.revenue })),
        valueLabel: 'Revenue',
      },
      table: {
        columns: [
          { key: 'name', label: 'Category' },
          { key: 'revenue', label: 'Revenue', format: 'currency' },
        ],
        rows: detail.categories,
      },
    },
    storeRows: detail.stores.map((s) => ({ ...s, share: s.revenue / detail.revenue })),
  }
}
