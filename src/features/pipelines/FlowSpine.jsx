import { StatusIcon } from '../../components/ui/StatusBadge.jsx'
import { STEP_KINDS } from '../../data/pipelines.js'
import { formatDuration, formatNumber } from '../../lib/format.js'
import { mainChain, sideInputs, stepIcon } from './pipelineGraph.js'

/*
  iPad and phone view of a pipeline: the main chain of steps as a vertical list
  joined by a "pipe". The pipe between two steps is labelled with the rows that
  flowed through it, so you can read the data's journey top to bottom:
  638,914 rows -> 195,436 rows -> stopped here.

  Side inputs (e.g. the targets Excel file) are not drawn as crossing lines;
  they appear as a "Merges with" link on the step they join. Nothing to pan,
  nothing to pinch, everything is a full-width tap target.
*/

// Pipe colors per state of the step the data flows out of.
const PIPE = {
  succeeded: 'bg-series',
  running: 'bg-run',
  failed: 'bg-fail',
  waiting: 'border-l-2 border-dashed border-line-strong',
}

function Pipe({ status, className = '' }) {
  return status === 'waiting' ? (
    <span className={`absolute left-1/2 -translate-x-px ${PIPE.waiting} ${className}`} aria-hidden="true" />
  ) : (
    <span className={`absolute left-1/2 w-0.5 -translate-x-1/2 ${PIPE[status]} ${className}`} aria-hidden="true" />
  )
}

function pipeLabel(step) {
  if (step.status === 'succeeded') return `${formatNumber(step.rowsOut)} rows`
  if (step.status === 'failed') return 'Stopped here'
  if (step.status === 'running') return 'Running'
  return 'Not run'
}

export default function FlowSpine({ pipeline, selectedId, onSelect }) {
  const chain = mainChain(pipeline)
  const sides = sideInputs(pipeline)

  return (
    <ol aria-label={`Steps in ${pipeline.name}`}>
      {chain.map((step, i) => {
        const last = i === chain.length - 1
        const incoming = i > 0 ? chain[i - 1].status : null
        return (
          <li key={step.id}>
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3">
              {/* Gutter: the step's node on the pipe */}
              <div className="relative flex justify-center pt-3">
                {incoming && <Pipe status={incoming} className="top-0 h-3" />}
                {!last && <Pipe status={step.status} className="top-[3.5rem] bottom-0" />}
                <StepNode step={step} />
              </div>

              <StepCard
                step={step}
                index={i}
                total={chain.length}
                selected={step.id === selectedId}
                onSelect={onSelect}
                sides={sides.get(step.id) ?? []}
                selectedId={selectedId}
              />
            </div>

            {!last && (
              <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3" aria-hidden="true">
                <div className="relative h-9">
                  <Pipe status={step.status} className="inset-y-0" />
                </div>
                <p
                  className={`self-center text-[13px] tabular-nums ${
                    step.status === 'failed' ? 'font-medium text-fail' : 'text-ink-muted'
                  }`}
                >
                  {pipeLabel(step)}
                </p>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

const NODE = {
  succeeded: 'border-line-strong bg-surface text-ink',
  running: 'border-run bg-run-soft text-run',
  failed: 'border-fail bg-fail-soft text-fail',
  waiting: 'border-dashed border-line-strong bg-paper text-ink-faint',
}

function StepNode({ step }) {
  const Icon = stepIcon(step)
  return (
    <span className={`relative z-10 grid size-11 place-items-center rounded-full border-2 ${NODE[step.status]}`}>
      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}

function StepCard({ step, index, total, selected, onSelect, sides, selectedId }) {
  const failed = step.status === 'failed'
  return (
    <div
      className={`my-1 rounded-xl border bg-surface transition-colors ${
        selected ? 'border-ink ring-1 ring-ink' : failed ? 'border-fail/50' : 'border-line'
      } ${step.status === 'waiting' ? 'bg-surface/60' : ''}`}
    >
      <button
        type="button"
        onClick={() => onSelect(step.id)}
        aria-current={selected ? 'step' : undefined}
        className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-ink-muted">
            Step {index + 1} of {total}, {STEP_KINDS[step.kind].toLowerCase()}
          </span>
          <span className={`mt-0.5 block font-medium ${step.status === 'waiting' ? 'text-ink-muted' : ''}`}>
            {step.name}
          </span>
          <span className="mt-0.5 block truncate text-sm text-ink-muted">{step.target}</span>
          {failed && step.error && (
            <span className="mt-2 block text-sm text-fail">{step.error.summary}</span>
          )}
          {step.edited && <span className="mt-2 block text-sm text-warn">Changed, applies on the next run</span>}
          {step.appliedFix && step.status === 'waiting' && (
            <span className="mt-2 block text-sm text-ok">Fix approved, ready to re-run</span>
          )}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
          <StatusIcon status={step.status} />
          {step.durationMs != null && (
            <span className="text-xs text-ink-muted tabular-nums">{formatDuration(step.durationMs)}</span>
          )}
        </span>
      </button>

      {sides.length > 0 && (
        <div className="border-t border-line px-2 py-1.5">
          {sides.map((side) => {
            const Icon = stepIcon(side)
            return (
              <button
                key={side.id}
                type="button"
                onClick={() => onSelect(side.id)}
                aria-current={side.id === selectedId ? 'step' : undefined}
                className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-sunken ${
                  side.id === selectedId ? 'bg-sunken font-medium' : ''
                }`}
              >
                <Icon className="size-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
                <span className="min-w-0 flex-1 py-1">
                  <span className="block text-xs text-ink-muted">Merges with</span>
                  <span className="block truncate" title={side.target}>{side.target}</span>
                </span>
                <span className="shrink-0 pl-2 text-[13px] text-ink-muted tabular-nums">
                  {side.rowsOut != null ? `${formatNumber(side.rowsOut)} rows` : ''}
                </span>
                <StatusIcon status={side.status} className="size-4" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
