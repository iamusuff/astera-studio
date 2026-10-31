import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useIsPhone, useMediaQuery } from '../../hooks/useMediaQuery.js'
import { formatPercent } from '../../lib/format.js'
import ChartLegend from './ChartLegend.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { axisProps as axisPropsFor, axisTick, percentTicks, useChartColors } from './chartTheme.js'

/*
  Draws a chart from a small "spec" object, so chat answers and dashboard tiles
  share the same four chart types:

    bar-vs-target   rows: { label, value, target, flagged }   bars with target bars behind
    attainment      rows: { label, value, flagged }           % of target with a 100% line
    grouped         rows: { label, a, b }, series: [a, b]     two periods or regions side by side
    line-vs-target  rows: { label, value, target }            monthly trend with a target line
    bars            rows: { label, value, flagged }           one value per item, optional reference line

  Rows can be "dimmed" to keep context while a filter focuses on one item.

  Color rule: slate for data, grey for comparison, red only for "below target".
  onSelect(row) makes a whole column tappable, not just the thin bar, so it is
  an easy target on a phone (used for drill-down on the dashboard).
*/
export default function ChartView({ spec, height = 260, onSelect }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const C = useChartColors()
  const axisProps = axisPropsFor(C)
  const isPhone = useIsPhone()
  // Long category names don't fit under narrow columns on a phone, so simple bar
  // charts turn sideways there: names on the left, bars running right.
  const horizontal =
    spec.kind === 'bars' && isPhone && Math.max(...spec.rows.map((r) => r.label.length)) > 7
  const common = {
    data: spec.rows,
    margin: { top: 8, right: 8, bottom: 0, left: 0 },
    accessibilityLayer: true,
    ...(onSelect && {
      onClick: (state) => {
        const index = state?.activeTooltipIndex ?? state?.activeIndex
        if (index != null && spec.rows[index]) onSelect(spec.rows[index])
      },
      style: { cursor: 'pointer' },
    }),
  }
  // Faded rows stay visible for comparison while a filter focuses on one item.
  const fill = (row, color) => <Cell key={row.label} fill={color} fillOpacity={row.dimmed ? 0.3 : 1} />
  // Charts redraw on every filter change, so motion stays short (under 300ms) and ease-out:
  // enough to show what changed, never enough to make you wait.
  const animate = { isAnimationActive: !reduceMotion, animationDuration: 300, animationEasing: 'ease-out' }
  const yAxis = (
    <YAxis {...axisProps} axisLine={false} width={48} tickCount={4} tickFormatter={axisTick(spec.format)} />
  )
  const xAxis = <XAxis {...axisProps} dataKey="label" axisLine={{ stroke: C.line }} interval={0} />
  const grid = <CartesianGrid vertical={false} stroke={C.line} />
  const tooltip = (extra) => (
    <Tooltip
      content={<ChartTooltip format={spec.format} extra={extra} />}
      cursor={spec.kind === 'line-vs-target' ? { stroke: C.line } : { fill: C.sunken }}
    />
  )
  const anyFlagged = spec.rows.some((r) => r.flagged)

  let chart
  let legend

  if (spec.kind === 'bar-vs-target') {
    chart = (
      <BarChart {...common} barGap={3}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip((row) => `${formatPercent(row.value / row.target)} of target`)}
        <Bar dataKey="target" name="Target" radius={[6, 6, 2, 2]} maxBarSize={22} {...animate}>
          {spec.rows.map((row) => fill(row, C.seriesMuted))}
        </Bar>
        <Bar dataKey="value" name={spec.valueLabel} radius={[6, 6, 2, 2]} maxBarSize={22} {...animate}>
          {spec.rows.map((row) => fill(row, row.flagged ? C.fail : C.series))}
        </Bar>
      </BarChart>
    )
    legend = [
      { label: spec.valueLabel, color: C.series },
      { label: 'Target', color: C.seriesMuted },
      ...(anyFlagged ? [{ label: spec.flaggedLabel, color: C.fail }] : []),
    ]
  }

  if (spec.kind === 'attainment') {
    // Even 25% steps, always including the 100% line.
    const top = Math.ceil(Math.max(1.05, ...spec.rows.map((r) => r.value)) * 4) / 4
    const ticks = Array.from({ length: top * 4 + 1 }, (_, i) => i / 4)
    chart = (
      <BarChart {...common}>
        {grid}
        {xAxis}
        <YAxis {...axisProps} axisLine={false} width={48} domain={[0, top]} ticks={ticks} tickFormatter={axisTick('percent')} />
        {tooltip()}
        <ReferenceLine y={1} stroke={C.ink} strokeDasharray="4 3" ifOverflow="extendDomain" />
        <Bar dataKey="value" name={spec.valueLabel} radius={[6, 6, 2, 2]} maxBarSize={36} {...animate}>
          {spec.rows.map((row) => fill(row, row.flagged ? C.fail : C.series))}
        </Bar>
      </BarChart>
    )
    legend = [
      { label: 'At or above target', color: C.series },
      { label: spec.flaggedLabel, color: C.fail },
      { label: '100% of target', color: C.ink, shape: 'dash' },
    ]
  }

  if (spec.kind === 'grouped') {
    chart = (
      <BarChart {...common} barGap={3}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip()}
        {spec.reference && <ReferenceLine y={spec.reference} stroke={C.ink} strokeDasharray="4 3" />}
        <Bar dataKey="a" name={spec.series[0].label} fill={C.seriesMuted} radius={[6, 6, 2, 2]} maxBarSize={22} {...animate} />
        <Bar dataKey="b" name={spec.series[1].label} fill={C.series} radius={[6, 6, 2, 2]} maxBarSize={22} {...animate} />
      </BarChart>
    )
    legend = [
      { label: spec.series[0].label, color: C.seriesMuted },
      { label: spec.series[1].label, color: C.series },
      ...(spec.reference ? [{ label: '100% of target', color: C.ink, shape: 'dash' }] : []),
    ]
  }

  if (horizontal) {
    chart = (
      <BarChart {...common} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={C.line} />
        <XAxis {...axisProps} type="number" axisLine={false} tickCount={4} tickFormatter={axisTick(spec.format)} />
        <YAxis {...axisProps} type="category" dataKey="label" axisLine={{ stroke: C.line }} width={88} interval={0} />
        {tooltip()}
        {spec.reference != null && <ReferenceLine x={spec.reference} stroke={C.ink} strokeDasharray="4 3" />}
        <Bar dataKey="value" name={spec.valueLabel} radius={[2, 6, 6, 2]} maxBarSize={22} {...animate}>
          {spec.rows.map((row) => fill(row, row.flagged ? C.fail : C.series))}
        </Bar>
      </BarChart>
    )
    legend = [
      { label: spec.valueLabel, color: C.series },
      ...(anyFlagged ? [{ label: spec.flaggedLabel, color: C.fail }] : []),
      ...(spec.reference != null ? [{ label: spec.referenceLabel, color: C.ink, shape: 'dash' }] : []),
    ]
  } else if (spec.kind === 'bars') {
    const ticks = spec.format === 'percent' ? percentTicks(Math.max(...spec.rows.map((r) => r.value))) : undefined
    chart = (
      <BarChart {...common}>
        {grid}
        {xAxis}
        {ticks ? (
          <YAxis {...axisProps} axisLine={false} width={48} domain={[0, ticks.at(-1)]} ticks={ticks} tickFormatter={axisTick('percent')} />
        ) : (
          yAxis
        )}
        {tooltip()}
        {spec.reference != null && <ReferenceLine y={spec.reference} stroke={C.ink} strokeDasharray="4 3" />}
        <Bar dataKey="value" name={spec.valueLabel} radius={[6, 6, 2, 2]} maxBarSize={36} {...animate}>
          {spec.rows.map((row) => fill(row, row.flagged ? C.fail : C.series))}
        </Bar>
      </BarChart>
    )
    legend = [
      { label: spec.valueLabel, color: C.series },
      ...(anyFlagged ? [{ label: spec.flaggedLabel, color: C.fail }] : []),
      ...(spec.reference != null ? [{ label: spec.referenceLabel, color: C.ink, shape: 'dash' }] : []),
    ]
  }

  if (spec.kind === 'line-vs-target') {
    // Months below target get a red dot: the pattern is visible without reading numbers.
    const dot = ({ cx, cy, payload }) => (
      <circle
        key={payload.label}
        cx={cx}
        cy={cy}
        r={3.5}
        fill={payload.value < payload.target ? C.fail : C.series}
        stroke={C.surface}
        strokeWidth={1.5}
      />
    )
    // A trend line doesn't need a zero baseline (bars do): zoom the axis to the data
    // so the shape of the trend is visible.
    chart = (
      <LineChart {...common}>
        {grid}
        <XAxis {...axisProps} dataKey="label" axisLine={{ stroke: C.line }} interval={0} padding={{ left: 14, right: 14 }} />
        <YAxis
          {...axisProps}
          axisLine={false}
          width={48}
          tickCount={4}
          domain={[(min) => Math.floor((min * 0.94) / 1e5) * 1e5, (max) => Math.ceil((max * 1.03) / 1e5) * 1e5]}
          tickFormatter={axisTick(spec.format)}
        />
        {tooltip()}
        <Line dataKey="target" name={spec.targetLabel} stroke={C.inkFaint} strokeDasharray="4 3" strokeWidth={1.5} dot={false} {...animate} />
        <Line dataKey="value" name={spec.valueLabel} stroke={C.series} strokeWidth={2} dot={dot} activeDot={{ r: 5 }} {...animate} />
      </LineChart>
    )
    legend = [
      { label: spec.valueLabel, color: C.series, shape: 'line' },
      { label: spec.targetLabel, color: C.inkFaint, shape: 'dash' },
      { label: 'Below target', color: C.fail, shape: 'dot' },
    ]
  }

  return (
    <div>
      <ChartLegend items={legend} />
      <div style={{ height: horizontal ? spec.rows.length * 38 + 32 : height }} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
