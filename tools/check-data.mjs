/*
  Consistency checks for the sample data and the pipeline state logic.
  Run from the project root:  node tools/check-data.mjs

  It checks that numbers agree across screens (KPIs, charts, drill-downs, pipeline
  row counts) and walks the main story: re-run without a fix fails, approve the
  fix, re-run succeeds, and a light edit changes row counts downstream.
*/
const root = new URL('../src/', import.meta.url).href
const m = await import(root + 'data/metrics.js')
const { PIPELINES } = await import(root + 'data/pipelines.js')
const ops = await import(root + 'state/pipelineReducer.js')
const assert = (c, msg) => { if (!c) { console.log('FAIL', msg); process.exitCode = 1 } else console.log('ok  ', msg) }

// --- Numbers
const q3 = m.getRegionRows('q3')
console.table(q3.map(r => ({ name: r.name, revenue: r.revenue, target: r.target, att: (r.attainment*100).toFixed(1)+'%', missed: r.missed })))
assert(q3.filter(r => r.missed).map(r => r.name).join() === 'West,Central', 'Q3: exactly West and Central missed')
const k = m.getKpis('q3')
console.log('Q3 KPIs', { revenue: k.revenue, att: (k.attainment*100).toFixed(2), orders: k.orders, aov: k.avgOrderValue.toFixed(2), ret: (k.returnRate*100).toFixed(2), prev: k.previousLabel })
assert(k.revenue === q3.reduce((s, r) => s + r.revenue, 0), 'KPI revenue = sum of region rows')
const series = m.getMonthlySeries('q3')
assert(series.reduce((s, x) => s + x.revenue, 0) === k.revenue, 'monthly series sums to KPI revenue')
const ytd = m.getKpis('ytd', 'west')
assert(ytd.previous === null && ytd.revenue > 0, 'YTD West has no previous period')
const bd = m.getRegionBreakdown('q3', 'west')
assert(Math.abs(bd.categories.reduce((s, c) => s + c.revenue, 0) - bd.revenue) <= 5, 'drill-down categories add up to region revenue')
console.log('West stores', bd.stores.map(s => s.name + ' ' + s.revenue).join(' | '))
console.log('Return rates', m.getReturnRates('q3').map(r => r.name + ' ' + (r.returnRate*100).toFixed(1)).join(', '))

// --- Pipeline story
let p = PIPELINES.find(x => x.id === 'regional-sales')
const t = (i) => `2026-10-31T09:${String(10 + i).padStart(2, '0')}:00.000Z`
const runAll = (p, from) => {
  p = ops.startRun(p, { fromStepId: from, runId: 'r', at: t(0) })
  let i = 1
  while (p.status === 'running' && i < 20) p = ops.tickRun(p, { at: t(i++) })
  return ops.tickRun(p, { at: t(99) }) // extra late tick must be ignored
}
let again = runAll(p, 'join')
assert(again.status === 'failed' && again.steps.find(s => s.id === 'join').status === 'failed', 're-run WITHOUT the fix fails again at the join')
assert(again.lastSuccessAt === p.lastSuccessAt, 'failed re-run keeps the old last-good time')

p = ops.applyFix(p, { stepId: 'join', at: t(0) })
const j = p.steps.find(s => s.id === 'join')
assert(j.config.rightKey === 'Sales_Region' && j.status === 'waiting' && !j.error, 'approve fix: key changed, step ready, error cleared')
assert(p.status === 'failed', 'approving alone does not pretend the data is fresh')

p = runAll(p, 'join')
assert(p.status === 'succeeded', 're-run after fix succeeds')
assert(p.lastSuccessAt !== PIPELINES[0].lastSuccessAt && p.lastRun.finishedAt !== t(99), 'fresh timestamp set, late tick ignored')
console.log('rows through the pipe:', p.steps.map(s => `${s.id}:${s.rowsIn ?? '-'}→${s.rowsOut}`).join('  '))
assert(p.steps.every(s => s.status === 'succeeded'), 'every step succeeded')
assert(p.runs[0].by === 'Muhammad Yousuf' && p.runs[0].status === 'succeeded', 'run history records who re-ran it')

// --- Light edit changes the filter output on the next run
let e = ops.editStep(p, { stepId: 'filter', config: { statuses: ['completed', 'shipped'] }, summary: 'also keep shipped orders', at: t(0) })
e = runAll(e, 'filter')
assert(e.steps.find(s => s.id === 'filter').rowsOut === 209651, 'filter edit: 195,436 + 14,215 = 209,651 rows after re-run')
assert(e.steps.find(s => s.id === 'join').rowsIn === 209651, 'downstream join receives the new row count')
const opt = (await import(root + 'data/pipelines.js')).ORDER_STATUS_OPTIONS
assert(opt[0].rows === m.getKpis('q3').orders, 'pipeline completed-Q3 rows === dashboard Q3 orders')
assert(PIPELINES[0].steps.find(s=>s.id==='orders').rowsOut >= m.getKpis('ytd').orders, 'orders table holds at least the YTD orders')
