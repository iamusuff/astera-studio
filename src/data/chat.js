import { formatCurrencyCompact, formatPercent } from '../lib/format.js'
import { getMonthlySeries, getRegionBreakdown, getRegionRows } from './metrics.js'

/*
  The chat's answers. There is no AI in this mockup: each answer is built from
  the same metrics as the dashboard, so the summary text, chart and table can
  never disagree with any other screen.

  Answer shape:
  {
    id, question,                 // the question as the user would phrase it
    title, subtitle,              // chart title (also used when pinned to the dashboard)
    summary,                      // 2-3 plain sentences: the answer comes first
    chart,                        // chart spec, see components/charts/ChartView.jsx
    table,                        // { columns, rows } for "View as table"
    pipelineId,                   // where the data came from
    followUps: string[],          // ids of suggested next questions
  }
*/

const pct = (r, options) => formatPercent(r, options)
const money = (v) => formatCurrencyCompact(v)
const listNames = (names) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']
const MONTH_NAMES = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September' }

function missedTarget() {
  const rows = getRegionRows('q3')
  const missed = rows.filter((r) => r.missed).sort((a, b) => a.attainment - b.attainment)
  const hit = rows.filter((r) => !r.missed)
  const total = rows.reduce((s, r) => s + r.revenue, 0) / rows.reduce((s, r) => s + r.target, 0)
  const [first, ...rest] = missed

  return {
    id: 'missed-target',
    question: 'Which regions missed their sales target last quarter?',
    title: 'Q3 revenue vs target by region',
    subtitle: 'Q3 2026, all regions',
    summary:
      `${NUMBER_WORDS[missed.length]} regions missed their Q3 target. ` +
      `${first.name} reached ${pct(first.attainment)} (${money(first.revenue)} of ${money(first.target)})` +
      rest.map((r) => ` and ${r.name} ${pct(r.attainment)} (${money(r.revenue)} of ${money(r.target)})`).join('') +
      `. ${listNames(hit.map((r) => r.name))} beat their targets, so Halden finished the quarter at ${pct(total)} of target overall.`,
    chart: {
      kind: 'bar-vs-target',
      format: 'currency',
      rows: rows.map((r) => ({ label: r.name, value: r.revenue, target: r.target, flagged: r.missed })),
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
    },
    pipelineId: 'regional-sales',
    followUps: ['attainment-view', 'compare-q2', 'west-trend'],
  }
}

// "Ask the chat to change a chart": same data, shown as a share of target.
function attainmentView() {
  const rows = getRegionRows('q3')
  return {
    id: 'attainment-view',
    question: 'Show that as a percentage of target',
    title: 'Q3 revenue as % of target',
    subtitle: 'Q3 2026, all regions',
    summary:
      'Here is the same Q3 data as a share of each region’s target. Anything below the 100% line missed its target.',
    chart: {
      kind: 'attainment',
      format: 'percent',
      rows: rows.map((r) => ({ label: r.name, value: r.attainment, flagged: r.missed })),
      valueLabel: 'Revenue as % of target',
      flaggedLabel: 'Below target',
    },
    table: {
      columns: [
        { key: 'name', label: 'Region' },
        { key: 'attainment', label: 'Of target', format: 'percent' },
        { key: 'variance', label: 'Difference', format: 'currency-signed' },
      ],
      rows,
    },
    pipelineId: 'regional-sales',
    followUps: ['compare-q2', 'west-trend', 'by-category'],
  }
}

function compareQ2() {
  const q2 = getRegionRows('q2')
  const q3 = getRegionRows('q3')
  const rows = q3.map((r, i) => ({ name: r.name, q2: q2[i].attainment, q3: r.attainment, change: r.attainment - q2[i].attainment }))
  const drops = [...rows].sort((a, b) => a.change - b.change)
  const [worst, second] = drops
  const recovered = rows.filter((r) => r.q2 < 1 && r.q3 >= 1)

  return {
    id: 'compare-q2',
    question: 'How does that compare to Q2?',
    title: 'Revenue as % of target, Q2 vs Q3',
    subtitle: 'Q2 and Q3 2026, all regions',
    summary:
      `${worst.name} slipped the most, from ${pct(worst.q2)} of target in Q2 to ${pct(worst.q3)} in Q3. ` +
      `${second.name} went from ${pct(second.q2)} to ${pct(second.q3)}.` +
      (recovered.length
        ? ` ${listNames(recovered.map((r) => r.name))} was just under target in Q2 and recovered to ${pct(recovered[0].q3)}.`
        : ''),
    chart: {
      kind: 'grouped',
      format: 'percent',
      rows: rows.map((r) => ({ label: r.name, a: r.q2, b: r.q3 })),
      series: [
        { key: 'a', label: 'Q2 2026' },
        { key: 'b', label: 'Q3 2026' },
      ],
      reference: 1,
    },
    table: {
      columns: [
        { key: 'name', label: 'Region' },
        { key: 'q2', label: 'Q2', format: 'percent' },
        { key: 'q3', label: 'Q3', format: 'percent' },
        { key: 'change', label: 'Change', format: 'points' },
      ],
      rows,
    },
    pipelineId: 'regional-sales',
    followUps: ['west-trend', 'by-category'],
  }
}

function westTrend() {
  const series = getMonthlySeries('ytd', 'west')
  const peakIndex = series.reduce((best, m, i) => (m.revenue > series[best].revenue ? i : best), 0)
  const peak = series[peakIndex]
  const last = series.at(-1)
  let falling = 0
  for (let i = series.length - 1; i > 0 && series[i].revenue < series[i - 1].revenue; i--) falling++
  const gap = 1 - last.revenue / last.target

  return {
    id: 'west-trend',
    question: 'Show me West’s monthly trend this year',
    title: 'West revenue by month',
    subtitle: 'Jan to Sep 2026, West region',
    summary:
      `West peaked in ${MONTH_NAMES[peak.month]} at ${money(peak.revenue)} and has fallen for ${NUMBER_WORDS[falling].toLowerCase()} months in a row. ` +
      `${MONTH_NAMES[last.month]} closed at ${money(last.revenue)}, ${pct(gap)} below the monthly target.`,
    chart: {
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
    pipelineId: 'regional-sales',
    followUps: ['by-category', 'compare-q2'],
  }
}

function byCategory() {
  const west = getRegionBreakdown('q3', 'west')
  const central = getRegionBreakdown('q3', 'central')
  const rows = west.categories.map((c) => ({
    name: c.name,
    west: c.revenue,
    central: central.categories.find((x) => x.id === c.id).revenue,
  }))
  const topShare = (b) => (b.categories[0].revenue + b.categories[1].revenue) / b.revenue

  return {
    id: 'by-category',
    question: 'Break West and Central down by product category',
    title: 'Q3 revenue by category, West and Central',
    subtitle: 'Q3 2026',
    summary:
      `${west.categories[0].name} and ${west.categories[1].name.toLowerCase()} bring in most of the revenue in both regions: ` +
      `${pct(topShare(west), { digits: 0 })} of West’s Q3 sales and ${pct(topShare(central), { digits: 0 })} of Central’s. ` +
      'Those two categories are where most of the gap to target sits.',
    chart: {
      kind: 'grouped',
      format: 'currency',
      rows: rows.map((r) => ({ label: r.name, a: r.west, b: r.central })),
      series: [
        { key: 'a', label: 'West' },
        { key: 'b', label: 'Central' },
      ],
    },
    table: {
      columns: [
        { key: 'name', label: 'Category' },
        { key: 'west', label: 'West', format: 'currency' },
        { key: 'central', label: 'Central', format: 'currency' },
      ],
      rows,
    },
    pipelineId: 'regional-sales',
    followUps: ['west-trend', 'compare-q2'],
  }
}

const BUILDERS = {
  'missed-target': missedTarget,
  'attainment-view': attainmentView,
  'compare-q2': compareQ2,
  'west-trend': westTrend,
  'by-category': byCategory,
}

export const getAnswer = (id) => BUILDERS[id]?.() ?? null

// Shown on the empty chat screen.
export const STARTER_QUESTIONS = ['missed-target', 'west-trend', 'by-category']

// Typed questions are matched to a known answer by keywords. Anything else gets
// an honest "I can't answer that here" with suggestions, instead of a fake answer.
const MATCHERS = [
  { id: 'attainment-view', test: /percent|%|share of target|as a share/i },
  { id: 'compare-q2', test: /q2|compare|previous quarter|than last/i },
  { id: 'by-category', test: /categor|product|footwear|outerwear/i },
  { id: 'west-trend', test: /trend|monthly|by month|over time/i },
  { id: 'missed-target', test: /miss|target|behind|under ?perform|region/i },
]

export function matchQuestion(text) {
  return MATCHERS.find((m) => m.test.test(text))?.id ?? null
}

