import { CURRENT_USER, ORDER_STATUS_OPTIONS } from '../data/pipelines.js'

/*
  Pure helpers that change one pipeline. The reducer in AppStore calls these.
  Every function returns a new pipeline object; nothing is mutated.
*/

const updateStep = (pipeline, stepId, change) => ({
  ...pipeline,
  steps: pipeline.steps.map((s) => (s.id === stepId ? { ...s, ...change(s) } : s)),
})

const addLog = (step, at, text, tone) => [...step.log, { at, text, tone }]

/** Ids of a step and everything downstream of it (what a "re-run from here" re-runs). */
export function downstreamOf(pipeline, stepId) {
  const ids = new Set([stepId])
  let grew = true
  while (grew) {
    grew = false
    for (const s of pipeline.steps) {
      if (!ids.has(s.id) && s.inputs.some((i) => ids.has(i))) {
        ids.add(s.id)
        grew = true
      }
    }
  }
  return ids
}

/** A light edit from the Edit tab, e.g. which order statuses the filter keeps. */
export function editStep(pipeline, { stepId, config, summary, at }) {
  return updateStep(pipeline, stepId, (s) => ({
    config: { ...s.config, ...config },
    edited: true, // shown as "Changed, applies on next run"
    log: addLog(s, at, `${CURRENT_USER.name} changed this step: ${summary}`),
  }))
}

export function editSchedule(pipeline, { schedule }) {
  return { ...pipeline, schedule }
}

/** The person approved the suggested fix. The step is ready to run but has not run yet. */
export function applyFix(pipeline, { stepId, at }) {
  return updateStep(pipeline, stepId, (s) => {
    const config = { ...s.config, ...s.suggestion.patch }
    return {
      config,
      // A join's label shows its keys, so it must follow the fix: "region = Sales_Region".
      target: s.kind === 'join' && config.leftKey ? `${config.leftKey} = ${config.rightKey}` : s.target,
      status: 'waiting',
      resolvedError: s.error,
      appliedFix: s.suggestion,
      error: null,
      suggestion: null,
      log: addLog(s, at, `Fix approved by ${CURRENT_USER.name}: ${s.suggestion.title.toLowerCase()}`, 'ok'),
    }
  })
}

/**
 * Start a manual run. With fromStepId, only that step and everything after it
 * re-run (upstream steps keep their last results). Without it, the whole pipeline runs.
 */
export function startRun(pipeline, { fromStepId, runId, at }) {
  const affected = fromStepId ? downstreamOf(pipeline, fromStepId) : new Set(pipeline.steps.map((s) => s.id))
  const startsFirst = (s) => (fromStepId ? s.id === fromStepId : s.inputs.length === 0)
  return {
    ...pipeline,
    status: 'running',
    lastRun: { startedAt: at, finishedAt: null, status: 'running', trigger: 'manual' },
    runs: [
      { id: runId, startedAt: at, finishedAt: null, status: 'running', trigger: 'manual', by: CURRENT_USER.name },
      ...pipeline.runs,
    ],
    steps: pipeline.steps.map((s) => {
      if (!affected.has(s.id)) return s
      const first = startsFirst(s)
      return {
        ...s,
        status: first ? 'running' : 'waiting',
        rowsIn: first && s.inputs.length ? s.rowsIn : null,
        rowsOut: null,
        lastRowsIn: s.rowsIn, // what it received and produced last time
        lastRowsOut: s.rowsOut ?? s.healthy?.rowsOut ?? null,
        durationMs: null,
        edited: false,
        log: first ? addLog(s, at, `Re-run started by ${CURRENT_USER.name}`) : s.log,
      }
    }),
  }
}

// What a step outputs when it succeeds. Filters respect their current settings,
// joins keep every row once the keys match, everything else repeats its healthy
// (or last) count. A failed join "produced" 0, so it falls back to rows in.
function rowsOutFor(step, rowsIn) {
  if (step.kind === 'filter' && step.config?.statuses) {
    return ORDER_STATUS_OPTIONS.filter((o) => step.config.statuses.includes(o.id)).reduce(
      (total, o) => total + o.rows,
      0,
    )
  }
  if (step.kind === 'join') {
    // Keep the last match rate (e.g. 9,781 of 9,804). A join that matched nothing
    // last time was broken, so once it runs again every row matches.
    const rate = step.lastRowsOut > 0 && step.lastRowsIn ? step.lastRowsOut / step.lastRowsIn : 1
    return Math.round(rowsIn * rate)
  }
  if (step.kind === 'source') return step.lastRowsOut
  return step.healthy?.rowsOut ?? step.lastRowsOut ?? rowsIn
}

/**
 * One tick of a simulated run: every running step finishes (or fails, if it still
 * has an unresolved error), then any step whose inputs are all done starts.
 */
export function tickRun(pipeline, { at }) {
  // The timer may fire once more after the run ended; ignore it.
  if (pipeline.status !== 'running') return pipeline

  let steps = pipeline.steps
  let failed = false

  steps = steps.map((s) => {
    if (s.status !== 'running') return s
    if (s.error) {
      failed = true
      return { ...s, status: 'failed', rowsOut: 0, log: addLog(s, at, `Failed again: ${s.error.summary}`, 'fail') }
    }
    const rowsIn = s.rowsIn ?? steps.find((x) => x.id === s.inputs[0])?.rowsOut ?? null
    const rowsOut = rowsOutFor(s, rowsIn)
    return {
      ...s,
      status: 'succeeded',
      rowsIn,
      rowsOut,
      durationMs: s.healthy?.durationMs ?? s.durationMs,
      log: addLog(s, at, `Succeeded: ${rowsOut.toLocaleString('en-US')} rows out`, 'ok'),
    }
  })

  if (!failed) {
    steps = steps.map((s) => {
      const ready =
        s.status === 'waiting' &&
        s.inputs.length > 0 &&
        s.inputs.every((i) => steps.find((x) => x.id === i).status === 'succeeded')
      if (!ready) return s
      const first = steps.find((x) => x.id === s.inputs[0])
      return { ...s, status: 'running', rowsIn: first.rowsOut }
    })
  }

  const stillRunning = steps.some((s) => s.status === 'running')
  if (stillRunning) return { ...pipeline, steps }

  const status = failed ? 'failed' : 'succeeded'
  return {
    ...pipeline,
    steps,
    status,
    lastRun: { ...pipeline.lastRun, finishedAt: at, status },
    lastSuccessAt: failed ? pipeline.lastSuccessAt : at,
    runs: [{ ...pipeline.runs[0], finishedAt: at, status }, ...pipeline.runs.slice(1)],
  }
}
