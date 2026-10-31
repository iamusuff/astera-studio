import { useLayoutEffect, useRef, useState } from 'react'

import { useChartColors } from '../../components/charts/chartTheme.js'
import { StatusIcon } from '../../components/ui/StatusBadge.jsx'
import { STEP_KINDS } from '../../data/pipelines.js'
import { formatCompactNumber, formatNumber } from '../../lib/format.js'
import { edges, gridLayout, stepIcon } from './pipelineGraph.js'

/*
  Desktop view of a pipeline: the whole flow at once, left to right, with no
  panning or zooming. Steps sit in a CSS grid (main chain in the first row, side
  inputs in the row below); connectors are drawn in an SVG layer on top, from
  the real measured positions of the boxes, so they stay right at any width.
  If the window is narrower than the flow, the diagram scrolls sideways inside
  its own box; the page itself never does.
*/

const edgeStyles = (C) => ({
  succeeded: { stroke: C.series, dash: null },
  running: { stroke: C.run, dash: '6 5', animate: true },
  failed: { stroke: C.fail, dash: '5 4' },
  waiting: { stroke: C.waiting, dash: '4 4' },
})

export default function FlowDiagram({ pipeline, selectedId, onSelect }) {
  const C = useChartColors()
  const EDGE = edgeStyles(C)
  const { positions, columns, rows } = gridLayout(pipeline)
  const containerRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const [paths, setPaths] = useState([])
  const stepById = new Map(pipeline.steps.map((s) => [s.id, s]))

  // Re-measure when the layout changes size or a step changes state.
  const statusKey = pipeline.steps.map((s) => s.status + s.rowsOut).join()
  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = () => {
      const box = container.getBoundingClientRect()
      const rect = (id) => {
        const r = nodeRefs.current.get(id).getBoundingClientRect()
        return { left: r.left - box.left, right: r.right - box.left, mid: r.top - box.top + r.height / 2 }
      }
      setPaths(
        edges(pipeline).map(({ from, to }) => {
          const a = rect(from)
          const b = rect(to)
          const x1 = a.right
          const y1 = a.mid
          const x2 = b.left
          const y2 = b.mid
          const mx = (x1 + x2) / 2
          const d = y1 === y2 ? `M${x1},${y1} H${x2}` : `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
          // Labels sit just above the line: at the midpoint of a straight connector,
          // beside the start of a curved one (so they never sit on the curve).
          const label = y1 === y2 ? { x: mx, y: y1 - 8, anchor: 'middle' } : { x: x1 + 6, y: y1 - 8, anchor: 'start' }
          return { id: `${from}-${to}`, d, from: stepById.get(from), label }
        }),
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [pipeline.id, statusKey])

  return (
    <div className="overflow-x-auto">
      <div
        ref={containerRef}
        className="relative grid gap-x-12 gap-y-8 p-6"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          // 8.5rem per step + 3rem per gap + padding: below this, scroll instead of squashing.
          minWidth: `calc(${columns} * 8.5rem + ${columns - 1} * 3rem + 2.5rem)`,
        }}
      >
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
          {paths.map((p) => {
            const style = EDGE[p.from.status]
            return (
              <g key={p.id}>
                <path
                  d={p.d}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={2.5}
                  strokeDasharray={style.dash ?? undefined}
                  strokeLinecap="round"
                  className={style.animate ? 'motion-safe:animate-[dash_0.8s_linear_infinite]' : ''}
                />
                {p.from.status === 'succeeded' && (
                  <text
                    x={p.label.x}
                    y={p.label.y}
                    textAnchor={p.label.anchor}
                    fontSize="12"
                    fill={p.from.rowsOut === 0 ? C.warn : C.inkMuted}
                    stroke={C.surface}
                    strokeWidth="4"
                    paintOrder="stroke"
                    className="tabular-nums"
                    fontWeight={p.from.rowsOut === 0 ? 600 : 400}
                  >
                    {formatCompactNumber(p.from.rowsOut)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Render in reading order (left to right, then top to bottom), so keyboard
            focus moves through the boxes in the same order the eye does. */}
        {[...pipeline.steps]
          .sort((x, y) => positions.get(x.id).col - positions.get(y.id).col || positions.get(x.id).row - positions.get(y.id).row)
          .map((step) => {
          const pos = positions.get(step.id)
          return (
            <div key={step.id} style={{ gridColumn: pos.col + 1, gridRow: pos.row + 1 }} className="relative">
              <FlowNode
                step={step}
                selected={step.id === selectedId}
                onSelect={onSelect}
                nodeRef={(el) => (el ? nodeRefs.current.set(step.id, el) : nodeRefs.current.delete(step.id))}
              />
            </div>
          )
        })}
      </div>
      <p className="px-5 pb-4 text-[13px] text-ink-muted">Numbers on the lines are rows passed to the next step.</p>
    </div>
  )
}

const NODE = {
  succeeded: 'border-transparent bg-surface shadow-[var(--shadow-card)]',
  running: 'border-run-dot/60 bg-surface shadow-[var(--shadow-card)]',
  failed: 'border-fail-dot/70 bg-surface shadow-[var(--shadow-card)]',
  waiting: 'border-dashed border-line-strong bg-paper',
}

// nodeRef, not ref: in React 18 a function component can't receive `ref` as a prop.
function FlowNode({ step, selected, onSelect, nodeRef }) {
  const Icon = stepIcon(step)
  const rows = step.rowsOut != null ? `${formatNumber(step.rowsOut)} rows` : null
  return (
    <button
      ref={nodeRef}
      type="button"
      onClick={() => onSelect(step.id)}
      aria-current={selected ? 'step' : undefined}
      className={`flex h-full min-h-28 w-full flex-col gap-1.5 rounded-2xl border p-3.5 text-left transition-[border-color,box-shadow] ${
        NODE[step.status]
      } ${selected ? 'border-tint shadow-[0_0_0_3px_var(--color-tint-soft)]' : 'hover:border-line-strong'}`}
    >
      <span className="flex items-center justify-between gap-2 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          {STEP_KINDS[step.kind]}
        </span>
        <StatusIcon status={step.status} className="size-3.5" />
      </span>
      <span className={`line-clamp-2 text-[13px] leading-snug font-semibold ${step.status === 'waiting' ? 'text-ink-muted' : ''}`}>
        {step.name}
      </span>
      <span className="mt-auto truncate text-xs text-ink-muted" title={step.target}>
        {step.target}
      </span>
      {rows && <span className="sr-only">{rows}</span>}
    </button>
  )
}
