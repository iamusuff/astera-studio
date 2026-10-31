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

import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { formatPercent } from '../../lib/format.js'
import ChartLegend from './ChartLegend.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { axisProps, axisTick, C } from './chartTheme.js'

/*
  Draws a chart from a small "spec" object, so chat answers and dashboard tiles
  share the same four chart types:

    bar-vs-target   rows: { label, value, target, flagged }   bars with target bars behind
    attainment      rows: { label, value, flagged }           % of target with a 100% line
    grouped         rows: { label, a, b }, series: [a, b]     two periods or regions side by side
    line-vs-target  rows: { label, value, target }            monthly trend with a target line

  Color rule: slate for data, grey for comparison, red only for "below target".
  onSelect(row) makes bars tappable (used for drill-down on the dashboard).
*/
export default function ChartView({ spec, height = 260, onSelect }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const common = {
    data: spec.rows,
    margin: { top: 8, right: 8, bottom: 0, left: 0 },
    accessibilityLayer: true,
  }
  const animate = { isAnimationActive: !reduceMotion, animationDuration: 450 }
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
  const clickable = onSelect
    ? { onClick: (data) => onSelect(data.payload ?? data), style: { cursor: 'pointer' } }
    : {}

  let chart
  let legend

  if (spec.kind === 'bar-vs-target') {
    chart = (
      <BarChart {...common} barGap={3}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip((row) => `${formatPercent(row.value / row.target)} of target`)}
        <Bar dataKey="target" name="Target" fill={C.seriesMuted} radius={[3, 3, 0, 0]} maxBarSize={22} {...animate} {...clickable} />
        <Bar dataKey="value" name={spec.valueLabel} radius={[3, 3, 0, 0]} maxBarSize={22} {...animate} {...clickable}>
          {spec.rows.map((row) => (
            <Cell key={row.label} fill={row.flagged ? C.fail : C.series} />
          ))}
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
        <Bar dataKey="value" name={spec.valueLabel} radius={[3, 3, 0, 0]} maxBarSize={36} {...animate} {...clickable}>
          {spec.rows.map((row) => (
            <Cell key={row.label} fill={row.flagged ? C.fail : C.series} />
          ))}
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
        <Bar dataKey="a" name={spec.series[0].label} fill={C.seriesMuted} radius={[3, 3, 0, 0]} maxBarSize={22} {...animate} />
        <Bar dataKey="b" name={spec.series[1].label} fill={C.series} radius={[3, 3, 0, 0]} maxBarSize={22} {...animate} />
      </BarChart>
    )
    legend = [
      { label: spec.series[0].label, color: C.seriesMuted },
      { label: spec.series[1].label, color: C.series },
      ...(spec.reference ? [{ label: '100% of target', color: C.ink, shape: 'dash' }] : []),
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
        stroke="#fff"
        strokeWidth={1.5}
      />
    )
    chart = (
      <LineChart {...common}>
        {grid}
        {xAxis}
        {yAxis}
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
      <div style={{ height }} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
