import { at } from '../lib/clock.js'

/*
  The four pipelines that feed Halden Outfitters' charts, frozen at 9:10 AM on Oct 31.

  Pipeline shape:
  {
    id, name, description,
    status: 'running' | 'succeeded' | 'failed' | 'scheduled',
    schedule: { label, time },        // time is 'HH:MM' for daily schedules
    lastRun: { startedAt, finishedAt, status, trigger },
    lastSuccessAt,                    // when the data behind its charts was last refreshed
    nextRunAt,
    feeds: string[],                  // dashboards and answers that use this pipeline
    steps: Step[],
    runs: Run[],                      // newest first
  }

  Step shape:
  {
    id, kind, name,
    target,                           // what it reads or writes, e.g. a file or table
    inputs: string[],                 // ids of the steps it takes data from (this is the graph)
    status: 'succeeded' | 'failed' | 'running' | 'waiting',
    rowsIn, rowsOut, durationMs,      // null when the step has not run yet
    config,                           // the light-edit settings shown in the Edit tab
    healthy,                          // rows/duration a successful run produces (used by re-run)
    error, suggestion,                // only on a failed step
    log: [{ at, text, tone }],
  }
*/

// The person using the demo: a business user who owns the dashboard, not a data engineer.
export const CURRENT_USER = { name: 'Muhammad Yousuf', initials: 'MY', role: 'Sales analyst', company: 'Halden Outfitters' }

// kind -> label used in the UI. Kept to the vocabulary business users already know.
export const STEP_KINDS = {
  source: 'Source',
  filter: 'Filter',
  clean: 'Clean',
  join: 'Join',
  aggregate: 'Summarise',
  calculate: 'Calculate',
  publish: 'Publish',
}

// Rows each order status contributes in Q3, so the Filter step can preview an edit
// ("195,436 rows -> 201,557 rows") before it is saved.
export const ORDER_STATUS_OPTIONS = [
  { id: 'completed', label: 'Completed', rows: 195436 },
  { id: 'shipped', label: 'Shipped, not yet delivered', rows: 14215 },
  { id: 'partially_returned', label: 'Partially returned', rows: 6390 },
]

export const SCHEDULE_OPTIONS = [
  { time: '05:00', label: 'Every day at 5:00 AM' },
  { time: '06:00', label: 'Every day at 6:00 AM' },
  { time: '07:00', label: 'Every day at 7:00 AM' },
]

// Fill in the fields most steps leave empty, so the definitions below stay readable.
function step(fields) {
  return {
    inputs: [],
    status: 'succeeded',
    rowsIn: null,
    rowsOut: null,
    durationMs: null,
    config: null,
    healthy: null,
    error: null,
    suggestion: null,
    log: [],
    ...fields,
  }
}

const dailyRuns = (time, endTime, days) =>
  days.map((d) => ({
    id: `run-${d}`,
    startedAt: at(d, time),
    finishedAt: at(d, endTime),
    status: 'succeeded',
    trigger: 'schedule',
    by: null,
  }))

export const PIPELINES = [
  {
    id: 'regional-sales',
    name: 'Regional sales',
    description: 'Combines completed orders with Finance’s quarterly targets to show revenue against target by region.',
    status: 'failed',
    schedule: { label: 'Every day at 6:00 AM', time: '06:00' },
    lastRun: { startedAt: at(0, '06:00'), finishedAt: at(0, '06:04'), status: 'failed', trigger: 'schedule' },
    lastSuccessAt: at(-1, '06:05'),
    nextRunAt: at(1, '06:00'),
    feeds: ['Sales overview', 'Chat answers about revenue'],
    steps: [
      step({
        id: 'targets',
        kind: 'source',
        name: 'Read Excel file',
        target: 'Q3_regional_targets.xlsx',
        location: 'SharePoint / Finance / Targets',
        rowsOut: 15,
        durationMs: 1800,
        columns: ['Sales_Region', 'Month', 'Target_USD'],
        log: [{ at: at(0, '06:00'), text: 'Read 15 rows, 3 columns' }],
      }),
      step({
        id: 'orders',
        kind: 'source',
        name: 'Read database table',
        target: 'warehouse.sales_orders',
        location: 'Snowflake / Halden warehouse',
        rowsOut: 638914,
        durationMs: 38400,
        log: [{ at: at(0, '06:01'), text: 'Read 638,914 rows' }],
      }),
      step({
        id: 'filter',
        kind: 'filter',
        name: 'Keep completed Q3 orders',
        target: 'order_status and order_date',
        inputs: ['orders'],
        rowsIn: 638914,
        rowsOut: 195436,
        durationMs: 6100,
        config: { statuses: ['completed'], period: 'Q3 2026' },
        log: [{ at: at(0, '06:02'), text: 'Kept 195,436 of 638,914 rows' }],
      }),
      step({
        id: 'join',
        kind: 'join',
        name: 'Match orders to targets',
        target: 'region = Region',
        inputs: ['filter', 'targets'],
        status: 'failed',
        rowsIn: 195436,
        rowsOut: 0,
        durationMs: 2300,
        config: { leftKey: 'region', rightKey: 'Region' },
        healthy: { rowsIn: 195436, rowsOut: 195436, durationMs: 8900 },
        error: {
          summary: 'The column Region is missing from Q3_regional_targets.xlsx',
          explanation:
            'Sara Ahmed (Finance) edited Q3_regional_targets.xlsx yesterday at 4:47 PM and renamed the Region column to Sales_Region. This step still looks for Region, so no order could be matched to a target and the run stopped here.',
          technical:
            "JoinError: right key 'Region' not found in input 'targets'. Available columns: Sales_Region, Month, Target_USD.",
          changedBy: 'Sara Ahmed',
          changedAt: at(-1, '16:47'),
        },
        suggestion: {
          title: 'Match on Sales_Region instead',
          explanation:
            'Only the column name changed. Its values (North, South, East, West, Central) are the same, so every order still finds its target.',
          patch: { rightKey: 'Sales_Region' },
          preview: {
            matchedBefore: 0,
            matchedAfter: 195436,
            unmatchedAfter: 0,
            sample: [
              { region: 'West', month: 'Jul', revenue: 1009635, target: 1116667 },
              { region: 'West', month: 'Aug', revenue: 978240, target: 1116667 },
              { region: 'Central', month: 'Jul', revenue: 821460, target: 866667 },
            ],
          },
        },
        log: [
          { at: at(0, '06:03'), text: 'Started matching 195,436 orders to targets' },
          { at: at(0, '06:04'), text: 'Failed: column Region not found', tone: 'fail' },
        ],
      }),
      step({
        id: 'summarise',
        kind: 'aggregate',
        name: 'Summarise by region and month',
        target: 'sum of revenue, count of orders',
        inputs: ['join'],
        status: 'waiting',
        healthy: { rowsIn: 195436, rowsOut: 15, durationMs: 4200 },
      }),
      step({
        id: 'variance',
        kind: 'calculate',
        name: 'Calculate variance to target',
        target: 'revenue − target',
        inputs: ['summarise'],
        status: 'waiting',
        healthy: { rowsIn: 15, rowsOut: 15, durationMs: 600 },
      }),
      step({
        id: 'publish',
        kind: 'publish',
        name: 'Publish to dashboard',
        target: 'Sales overview',
        inputs: ['variance'],
        status: 'waiting',
        healthy: { rowsIn: 15, rowsOut: 15, durationMs: 1100 },
      }),
    ],
    runs: [
      {
        id: 'run-0',
        startedAt: at(0, '06:00'),
        finishedAt: at(0, '06:04'),
        status: 'failed',
        trigger: 'schedule',
        by: null,
      },
      ...dailyRuns('06:00', '06:05', [-1, -2, -3, -4]),
    ],
  },

  {
    id: 'inventory-levels',
    name: 'Inventory levels',
    description: 'Turns hourly stock snapshots into weeks of cover for each product category.',
    status: 'running',
    schedule: { label: 'Every hour', time: null },
    lastRun: { startedAt: at(0, '09:02'), finishedAt: null, status: 'running', trigger: 'schedule' },
    lastSuccessAt: at(0, '08:04'),
    nextRunAt: at(0, '10:02'),
    feeds: ['Sales overview'],
    steps: [
      step({
        id: 'snapshots',
        kind: 'source',
        name: 'Read database table',
        target: 'warehouse.stock_snapshots',
        rowsOut: 96214,
        durationMs: 21300,
      }),
      step({
        id: 'products',
        kind: 'source',
        name: 'Read database table',
        target: 'catalog.products',
        rowsOut: 4870,
        durationMs: 3100,
      }),
      step({
        id: 'match-products',
        kind: 'join',
        name: 'Match stock to products',
        target: 'sku = sku',
        inputs: ['snapshots', 'products'],
        status: 'running',
        rowsIn: 96214,
        healthy: { rowsIn: 96214, rowsOut: 96214, durationMs: 6100 },
      }),
      step({
        id: 'cover',
        kind: 'calculate',
        name: 'Calculate weeks of cover',
        target: 'stock ÷ average weekly sales',
        inputs: ['match-products'],
        status: 'waiting',
        healthy: { rowsIn: 96214, rowsOut: 4870, durationMs: 2400 }, // one row per product
      }),
      step({
        id: 'publish',
        kind: 'publish',
        name: 'Publish to dashboard',
        target: 'Sales overview',
        inputs: ['cover'],
        status: 'waiting',
        healthy: { rowsIn: 4870, rowsOut: 4870, durationMs: 800 },
      }),
    ],
    runs: [
      { id: 'run-0', startedAt: at(0, '09:02'), finishedAt: null, status: 'running', trigger: 'schedule', by: null },
      { id: 'run-1', startedAt: at(0, '08:02'), finishedAt: at(0, '08:04'), status: 'succeeded', trigger: 'schedule', by: null },
      { id: 'run-2', startedAt: at(0, '07:02'), finishedAt: at(0, '07:04'), status: 'succeeded', trigger: 'schedule', by: null },
    ],
  },

  {
    id: 'customer-returns',
    name: 'Customer returns',
    description: 'Reads the nightly returns file and works out the return rate for each region.',
    status: 'succeeded',
    schedule: { label: 'Every day at 7:30 AM', time: '07:30' },
    lastRun: { startedAt: at(0, '07:30'), finishedAt: at(0, '07:33'), status: 'succeeded', trigger: 'schedule' },
    lastSuccessAt: at(0, '07:33'),
    nextRunAt: at(1, '07:30'),
    feeds: ['Sales overview'],
    steps: [
      step({
        id: 'returns-file',
        kind: 'source',
        name: 'Read CSV file',
        target: 'returns_2026-10-30.csv',
        location: 'SFTP / logistics-partner / outbound',
        rowsOut: 2847,
        durationMs: 2600,
      }),
      step({
        id: 'orders',
        kind: 'source',
        name: 'Read database table',
        target: 'warehouse.sales_orders',
        rowsOut: 638914,
        durationMs: 37900,
      }),
      step({
        id: 'clean',
        kind: 'clean',
        name: 'Standardise return reasons',
        target: 'reason_code',
        inputs: ['returns-file'],
        rowsIn: 2847,
        rowsOut: 2839,
        durationMs: 900,
      }),
      step({
        id: 'match-orders',
        kind: 'join',
        name: 'Match returns to orders',
        target: 'order_id = order_id',
        inputs: ['clean', 'orders'],
        rowsIn: 2839,
        rowsOut: 2839,
        durationMs: 7400,
      }),
      step({
        id: 'summarise',
        kind: 'aggregate',
        name: 'Summarise by region',
        target: 'return rate',
        inputs: ['match-orders'],
        rowsIn: 2839,
        rowsOut: 5,
        durationMs: 800,
      }),
      step({
        id: 'publish',
        kind: 'publish',
        name: 'Publish to dashboard',
        target: 'Sales overview',
        inputs: ['summarise'],
        rowsIn: 5,
        rowsOut: 5,
        durationMs: 700,
      }),
    ],
    runs: dailyRuns('07:30', '07:33', [0, -1, -2, -3, -4]),
  },

  {
    id: 'marketing-spend',
    name: 'Marketing spend',
    description: 'Joins campaign budgets with ad platform results to show return on spend by channel.',
    status: 'scheduled',
    schedule: { label: 'Every day at 6:00 PM', time: '18:00' },
    lastRun: { startedAt: at(-1, '18:00'), finishedAt: at(-1, '18:02'), status: 'succeeded', trigger: 'schedule' },
    lastSuccessAt: at(-1, '18:02'),
    nextRunAt: at(0, '18:00'),
    feeds: ['Marketing ROI'],
    steps: [
      step({
        id: 'budgets',
        kind: 'source',
        name: 'Read Excel file',
        target: 'campaign_budgets_2026.xlsx',
        rowsOut: 412,
        durationMs: 1400,
      }),
      step({
        id: 'ads',
        kind: 'source',
        name: 'Read from API',
        target: 'Ads reporting API',
        rowsOut: 9804,
        durationMs: 14600,
      }),
      step({
        id: 'match-campaigns',
        kind: 'join',
        name: 'Match results to budgets',
        target: 'campaign_id = campaign_id',
        inputs: ['ads', 'budgets'],
        rowsIn: 9804,
        rowsOut: 9781,
        durationMs: 3200,
      }),
      step({
        id: 'summarise',
        kind: 'aggregate',
        name: 'Summarise by channel and week',
        target: 'spend, revenue, return on spend',
        inputs: ['match-campaigns'],
        rowsIn: 9781,
        rowsOut: 156,
        durationMs: 1100,
      }),
      step({
        id: 'publish',
        kind: 'publish',
        name: 'Publish to dashboard',
        target: 'Marketing ROI',
        inputs: ['summarise'],
        rowsIn: 156,
        rowsOut: 156,
        durationMs: 600,
      }),
    ],
    runs: dailyRuns('18:00', '18:02', [-1, -2, -3, -4]),
  },
]
