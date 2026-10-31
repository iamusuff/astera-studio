import { RotateCw } from 'lucide-react'
import { useState } from 'react'

import Button from '../../components/ui/Button.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import { STEP_KINDS } from '../../data/pipelines.js'
import { formatClock, formatDuration, formatNumber } from '../../lib/format.js'
import { useActions } from '../../state/AppStore.jsx'
import FilterEditor from './FilterEditor.jsx'
import FixSuggestion from './FixSuggestion.jsx'
import { isEditable, stepIcon } from './pipelineGraph.js'

/*
  Everything about one step. The same component is a side panel on iPad and
  desktop and the content of a bottom sheet on phones (showHeader=false there,
  because the sheet has its own title).

  Tabs keep the sheet short on a phone: Details (status, numbers, the fix),
  Edit (only for steps that can be safely edited), Run log.
*/
export default function StepInspector({ pipeline, step, onSelect, showHeader = true }) {
  const [tab, setTab] = useState('details')
  const editable = isEditable(step)
  const tabs = [
    { id: 'details', label: 'Details' },
    ...(editable ? [{ id: 'edit', label: 'Edit' }] : []),
    { id: 'log', label: 'Run log' },
  ]
  const idBase = `step-${step.id}`
  const Icon = stepIcon(step)

  return (
    <div>
      {showHeader && (
        <header className="mb-4">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            {STEP_KINDS[step.kind]}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-lg font-semibold">{step.name}</h2>
            <StatusBadge status={step.status} />
          </div>
          <p className="mt-0.5 text-sm break-words text-ink-muted">
            {step.target}
            {step.location && <span className="block">{step.location}</span>}
          </p>
        </header>
      )}

      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Step details" idBase={idBase} />

      <div id={`${idBase}-panel`} role="tabpanel" aria-labelledby={`${idBase}-tab-${tab}`} className="pt-4">
        {tab === 'details' && <Details pipeline={pipeline} step={step} onSelect={onSelect} />}
        {tab === 'edit' && <FilterEditor key={step.config.statuses.join()} pipeline={pipeline} step={step} />}
        {tab === 'log' && <RunLog step={step} />}
      </div>
    </div>
  )
}

function Details({ pipeline, step, onSelect }) {
  const { rerun } = useActions()
  const running = pipeline.status === 'running'
  const blocker = pipeline.steps.find((s) => s.status === 'failed' && s.id !== step.id)
  const inputs = step.inputs.map((id) => pipeline.steps.find((s) => s.id === id))
  const rerunButton = (
    <Button variant="primary" onClick={() => rerun(pipeline.id, step.id)} disabled={running}>
      <RotateCw className="size-4" aria-hidden="true" />
      Re-run from this step
    </Button>
  )

  return (
    <div className="space-y-5">
      {step.status === 'failed' && step.error && <FixSuggestion pipeline={pipeline} step={step} />}

      {step.appliedFix && step.status === 'waiting' && !running && (
        <Notice tone="ok" title="Fix approved">
          <p>{step.appliedFix.title}. Re-run to bring {pipeline.feeds[0]} up to date.</p>
          {rerunButton}
        </Notice>
      )}

      {step.edited && !running && (
        <Notice tone="warn" title="Changed, not run yet">
          <p>Your change applies the next time this step runs.</p>
          {rerunButton}
        </Notice>
      )}

      {step.status === 'waiting' && !step.appliedFix && !running && blocker && (
        <p className="text-sm text-ink-muted">
          This step didn’t run because{' '}
          <button type="button" className="font-semibold text-tint-text" onClick={() => onSelect(blocker.id)}>
            {blocker.name}
          </button>{' '}
          failed.
        </p>
      )}

      {step.status === 'running' && <p className="text-sm text-run">Running now…</p>}

      {step.status === 'succeeded' && step.rowsOut === 0 && (
        <Notice tone="warn" title="Passed on no rows">
          <p>This step finished without errors but produced nothing, so every step after it works on empty data. Check its settings.</p>
        </Notice>
      )}

      <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl bg-paper">
        <Stat label="Rows in" value={step.rowsIn != null ? formatNumber(step.rowsIn) : '–'} />
        <Stat
          label="Rows out"
          value={step.rowsOut != null ? formatNumber(step.rowsOut) : '–'}
          fail={step.status === 'failed'}
        />
        <Stat label="Took" value={step.durationMs != null ? formatDuration(step.durationMs) : '–'} />
      </dl>

      {inputs.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold">{inputs.length > 1 ? 'Combines' : 'Takes data from'}</h3>
          <ul className="mt-1">
            {inputs.map((input) => (
              <li key={input.id}>
                <button
                  type="button"
                  onClick={() => onSelect(input.id)}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg text-left text-sm hover:underline pointer-fine:min-h-8"
                >
                  <StatusBadge status={input.status} variant="plain" label="" />
                  <span className="font-medium">{input.name}</span>
                  <span className="min-w-0 truncate text-ink-muted">{input.target}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!step.error && step.status === 'succeeded' && !step.edited && !running && step.inputs.length > 0 && (
        <div>{rerunButton}</div>
      )}
    </div>
  )
}

function Stat({ label, value, fail }) {
  return (
    <div className="px-3 py-2.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`mt-0.5 font-semibold tabular-nums ${fail ? 'text-fail' : ''}`}>{value}</dd>
    </div>
  )
}

function Notice({ tone, title, children }) {
  const tones = { ok: 'bg-ok-soft', warn: 'bg-warn-soft' }
  return (
    <div role="status" className={`space-y-3 rounded-2xl px-4 py-3.5 text-sm ${tones[tone]}`}>
      <p className="font-semibold">{title}</p>
      {children}
    </div>
  )
}

function RunLog({ step }) {
  if (!step.log.length) return <p className="text-sm text-ink-muted">This step hasn’t run yet today.</p>
  const TONE = { fail: 'text-fail', ok: 'text-ok' }
  return (
    <ol className="space-y-2.5 text-sm">
      {[...step.log].reverse().map((entry, i) => (
        <li key={i} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
          <time dateTime={entry.at} className="text-ink-muted tabular-nums">
            {formatClock(entry.at)}
          </time>
          <span className={TONE[entry.tone] ?? ''}>{entry.text}</span>
        </li>
      ))}
    </ol>
  )
}
