import { CATEGORIES, MONTHS, PERIODS, REGIONS } from './sales.js'

/*
  Pure functions that turn raw sales data into what the screens show.
  periodId: 'q1' | 'q2' | 'q3' | 'ytd'
  regionId: 'all' | a region id ('north', 'west', ...)
*/

export const getPeriod = (periodId) => PERIODS.find((p) => p.id === periodId)
export const getRegion = (regionId) => REGIONS.find((r) => r.id === regionId)

const sum = (values) => values.reduce((total, v) => total + v, 0)
const regionsFor = (regionId) => (regionId === 'all' ? REGIONS : [getRegion(regionId)])

function revenueOf(region, period) {
  return sum(period.months.map((m) => region.revenue[m]))
}

function targetOf(region, period) {
  return sum(period.quarters.map((q) => region.targets[q]))
}

// Order value drifts a little each quarter (Q3 is the reference), like real baskets do.
const ORDER_VALUE_DRIFT = { q1: 0.982, q2: 0.991, q3: 1 }

function ordersOf(region, period) {
  return period.quarters.reduce((total, q) => {
    const revenue = sum(getPeriod(q).months.map((m) => region.revenue[m]))
    return total + Math.round(revenue / (region.avgOrderValue * ORDER_VALUE_DRIFT[q]))
  }, 0)
}

function returnedOrdersOf(region, period) {
  // Each quarter has its own return rate, so weight by the orders in each quarter.
  return sum(
    period.quarters.map((q) => {
      const quarter = getPeriod(q)
      return ordersOf(region, quarter) * region.returnRate[q]
    }),
  )
}

/** One row per region: revenue vs target. Feeds the main bar chart and the chat answer. */
export function getRegionRows(periodId) {
  const period = getPeriod(periodId)
  return REGIONS.map((region) => {
    const revenue = revenueOf(region, period)
    const target = targetOf(region, period)
    return {
      id: region.id,
      name: region.name,
      revenue,
      target,
      attainment: revenue / target,
      variance: revenue - target,
      missed: revenue < target,
    }
  })
}

/** Headline numbers for the KPI tiles, with the previous period for comparison. */
export function getKpis(periodId, regionId = 'all') {
  const period = getPeriod(periodId)
  const regions = regionsFor(regionId)

  const totals = (p) => {
    const revenue = sum(regions.map((r) => revenueOf(r, p)))
    const target = sum(regions.map((r) => targetOf(r, p)))
    const orders = sum(regions.map((r) => ordersOf(r, p)))
    const returned = sum(regions.map((r) => returnedOrdersOf(r, p)))
    return {
      revenue,
      target,
      attainment: revenue / target,
      orders,
      avgOrderValue: revenue / orders,
      returnRate: returned / orders,
    }
  }

  const current = totals(period)
  const previous = period.previous ? totals(getPeriod(period.previous)) : null
  return { ...current, previous, previousLabel: previous ? getPeriod(period.previous).label : null }
}

/** Monthly revenue with the monthly share of the quarterly target, for the trend chart. */
export function getMonthlySeries(periodId, regionId = 'all') {
  const period = getPeriod(periodId)
  const regions = regionsFor(regionId)
  return period.months.map((m) => {
    const quarter = `q${Math.floor(m / 3) + 1}`
    return {
      month: MONTHS[m],
      revenue: sum(regions.map((r) => r.revenue[m])),
      target: Math.round(sum(regions.map((r) => r.targets[quarter])) / 3),
    }
  })
}

/** Drill-down for one region: revenue by product category and by store. */
export function getRegionBreakdown(periodId, regionId) {
  const period = getPeriod(periodId)
  const region = getRegion(regionId)
  const revenue = revenueOf(region, period)

  return {
    region,
    revenue,
    target: targetOf(region, period),
    categories: CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      revenue: Math.round(revenue * region.categoryMix[c.id]),
    })).sort((a, b) => b.revenue - a.revenue),
    stores: region.stores
      .map((s) => ({ name: s.name, revenue: Math.round(revenue * s.share) }))
      .sort((a, b) => b.revenue - a.revenue),
  }
}

/** Return rate per region, for the returns chart. */
export function getReturnRates(periodId) {
  const period = getPeriod(periodId)
  return REGIONS.map((region) => ({
    id: region.id,
    name: region.name,
    returnRate: returnedOrdersOf(region, period) / ordersOf(region, period),
  }))
}
