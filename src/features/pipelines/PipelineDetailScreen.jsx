import { ChevronDown, ChevronLeft, Play, RotateCw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'

import Button from '../../components/ui/Button.jsx'
import Freshness from '../../components/ui/Freshness.jsx'
import { notify } from '../../components/ui/notify.jsx'
import Sheet from '../../components/ui/Sheet.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { SCHEDULE_OPTIONS, STEP_KINDS } from '../../data/pipelines.js'
import { useIsDesktop, useIsPhone } from '../../hooks/useMediaQuery.js'
import { formatRelative } from '../../lib/format.js'
import { isStale, useActions, usePipeline } from '../../state/AppStore.jsx'
import FlowDiagram from './FlowDiagram.jsx'
import FlowSpine from './FlowSpine.jsx'
import { mainChain } from './pipelineGraph.js'
import RunHistory from './RunHistory.jsx'
import StepInspector from './StepInspector.jsx'

/*
  One pipeline, three layouts:
    desktop  the whole flow left to right at the top; the selected step's
             details below it, next to run history and settings
    iPad     split view: the step spine on the left, the selected step on the right
    phone    the step spine; tapping a step opens its details in a bottom sheet

  The selected step lives in the URL (?step=join), so "Review fix" links from the
  dashboard and chat open the failed step directly, on any device.
*/
export default function PipelineDetailScreen() {
  const { pipelineId } = useParams()
  const pipeline = usePipeline(pipelineId)
  const [params, setParams] = useSearchParams()
  const isPhone = useIsPhone()
  const isDesktop = useIsDesktop()
  useCompletionToast(pipeline)

  if (!pipeline) return <Navigate to="/pipelines" replace />

  const failedStep = pipeline.steps.find((s) => s.status === 'failed')
  const requested = pipeline.steps.find((s) => s.id === params.get('step'))
  // iPad and desktop always show a step; default to the one that needs attention.
  const selected = requested ?? (isPhone ? null : failedStep ?? mainChain(pipeline)[0])
  const select = (id) => setParams({ step: id }, { replace: true })
  const closeSheet = () => setParams({}, { replace: true })

  const inspector = selected && (
    <StepInspector key={selected.id} pipeline={pipeline} step={selected} onSelect={select} showHeader={!isPhone} />
  )

  return (
    <>
      <PipelineHeader pipeline={pipeline} />

      <div className="space-y-6 px-4 pb-10 md:px-8 xl:px-10">
        {failedStep?.error && <FailureBanner pipeline={pipeline} step={failedStep} onReview={() => select(failedStep.id)} />}

        {isDesktop ? (
          <>
            <section aria-label="Pipeline steps" className="rounded-xl border border-line bg-surface">
              <FlowDiagram pipeline={pipeline} selectedId={selected?.id} onSelect={select} />
            </section>
            <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-6">
              <section aria-label="Selected step" className="rounded-xl border border-line bg-surface p-5">
                {inspector}
              </section>
              <aside className="space-y-6">
                <RunHistory pipeline={pipeline} />
                <PipelineSettings pipeline={pipeline} />
              </aside>
            </div>
          </>
        ) : (
          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="space-y-6">
              <section aria-label="Pipeline steps">
                <FlowSpine pipeline={pipeline} selectedId={selected?.id} onSelect={select} />
              </section>
              <RunHistory pipeline={pipeline} />
              <PipelineSettings pipeline={pipeline} />
            </div>
            {!isPhone && (
              <section
                aria-label="Selected step"
                className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-xl border border-line bg-surface p-5"
              >
                {inspector}
              </section>
            )}
          </div>
        )}
      </div>

      {isPhone && (
        <Sheet
          open={!!selected}
          onOpenChange={(open) => !open && closeSheet()}
          title={selected?.name ?? ''}
          description={selected ? `${STEP_KINDS[selected.kind]}: ${selected.target}` : ''}
        >
          {inspector}
        </Sheet>
      )}
    </>
  )
}

function PipelineHeader({ pipeline }) {
  const { rerun } = useActions()
  const running = pipeline.status === 'running'
  const unresolved = pipeline.steps.some((s) => s.status === 'failed' && s.error)
  const ready = pipeline.steps.find((s) => s.appliedFix && s.status === 'waiting')

  let action
  if (running) {
    action = (
      <Button variant="secondary" disabled>
        <RotateCw className="size-4 motion-safe:animate-spin" aria-hidden="true" />
        Running
      </Button>
    )
  } else if (unresolved) {
    action = null // the failure banner right below carries "Review fix"
  } else if (ready) {
    action = (
      <Button variant="primary" onClick={() => rerun(pipeline.id, ready.id)}>
        <RotateCw className="size-4" aria-hidden="true" />
        Re-run from {ready.name.toLowerCase()}
      </Button>
    )
  } else {
    action = (
      <Button variant="secondary" onClick={() => rerun(pipeline.id, null)}>
        <Play className="size-4" aria-hidden="true" />
        Run now
      </Button>
    )
  }

  return (
    <header className="px-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-5 md:px-8 md:pt-6 xl:px-10">
      <Link
        to="/pipelines"
        className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg pr-3 pl-1 text-sm text-ink-muted hover:text-ink pointer-fine:min-h-8"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Pipelines
      </Link>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-[22px] font-semibold tracking-[-0.015em] md:text-2xl">{pipeline.name}</h1>
            <StatusBadge status={pipeline.status} />
          </div>
          <p className="mt-1 max-w-[62ch] text-ink-muted">{pipeline.description}</p>
          <Freshness at={pipeline.lastSuccessAt} stale={isStale(pipeline)} prefix="Data updated" className="mt-2" />
        </div>
        {action && <div className="w-full md:w-auto [&>button]:w-full md:[&>button]:w-auto">{action}</div>}
      </div>
    </header>
  )
}

function FailureBanner({ pipeline, step, onReview }) {
  const chain = mainChain(pipeline)
  const position = chain.findIndex((s) => s.id === step.id) + 1
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-xl border border-fail/30 bg-fail-soft px-4 py-3 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm">
        <span className="font-semibold">
          {position > 0 ? `Step ${position} of ${chain.length} failed` : 'A step failed'}: {step.name.toLowerCase()}.
        </span>{' '}
        {step.error.summary}. {pipeline.feeds[0]} is showing data from {formatRelative(pipeline.lastSuccessAt)}.
      </p>
      <Button variant="secondary" size="sm" onClick={onReview} className="self-start sm:self-auto">
        Review fix
      </Button>
    </div>
  )
}

function PipelineSettings({ pipeline }) {
  const { editSchedule, undo } = useActions()
  const daily = SCHEDULE_OPTIONS.some((o) => o.time === pipeline.schedule.time)

  function changeSchedule(time) {
    const option = SCHEDULE_OPTIONS.find((o) => o.time === time)
    const undoId = editSchedule(pipeline.id, { label: option.label, time })
    notify({
      title: 'Schedule changed',
      description: `${pipeline.name} now runs ${option.label.toLowerCase()}.`,
      action: { label: 'Undo', onClick: () => undo(undoId) },
    })
  }

  return (
    <section aria-labelledby="settings-heading" className="rounded-xl border border-line bg-surface p-4">
      <h2 id="settings-heading" className="text-sm font-semibold">
        Schedule and use
      </h2>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="text-ink-muted">
            <label htmlFor="schedule">Runs</label>
          </dt>
          <dd className="mt-1">
            {daily ? (
              <div className="relative">
                <select
                  id="schedule"
                  value={pipeline.schedule.time}
                  onChange={(e) => changeSchedule(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-line-strong bg-surface pr-10 pl-3 pointer-fine:h-9 pointer-fine:text-sm"
                >
                  {SCHEDULE_OPTIONS.map((o) => (
                    <option key={o.time} value={o.time}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              </div>
            ) : (
              pipeline.schedule.label
            )}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Next run</dt>
          <dd className="mt-0.5">{formatRelative(pipeline.nextRunAt)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Feeds</dt>
          <dd className="mt-0.5 space-y-0.5">
            {pipeline.feeds.map((f) =>
              f === 'Sales overview' ? (
                <Link key={f} to="/dashboard" className="block underline underline-offset-4">
                  Sales overview dashboard
                </Link>
              ) : (
                <span key={f} className="block">
                  {f}
                </span>
              ),
            )}
          </dd>
        </div>
      </dl>
    </section>
  )
}

// When a run you're watching finishes, say so, and offer the next step.
function useCompletionToast(pipeline) {
  const navigate = useNavigate()
  const previous = useRef(pipeline?.status)
  useEffect(() => {
    if (!pipeline) return
    const before = previous.current
    previous.current = pipeline.status
    if (before !== 'running' || pipeline.status === 'running') return
    if (pipeline.status === 'succeeded') {
      notify({
        title: `${pipeline.name} succeeded`,
        description: pipeline.feeds.includes('Sales overview') ? 'Sales overview is up to date.' : 'Data is up to date.',
        action: pipeline.feeds.includes('Sales overview')
          ? { label: 'View dashboard', onClick: () => navigate('/dashboard') }
          : undefined,
      })
    } else if (pipeline.status === 'failed') {
      const step = pipeline.steps.find((s) => s.status === 'failed')
      notify({ title: `${pipeline.name} failed again`, description: step?.error?.summary ?? 'A step failed.' })
    }
  }, [pipeline, navigate])
}
