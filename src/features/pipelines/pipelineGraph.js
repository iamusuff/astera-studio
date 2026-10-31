import { Calculator, Database, Eraser, FileCsv, FileXls, Funnel, GitMerge, Plug, Sigma, SquaresFour } from '@phosphor-icons/react'

/*
  Layout helpers for drawing a pipeline without a free-form canvas.

  Every pipeline here is a main line of steps, with side inputs merging into it
  (e.g. the targets Excel file joining the orders). So instead of placing boxes
  by hand on a canvas, we split the graph into:
    mainChain    the longest path, ending at the final step (drawn as the spine)
    sideInputs   steps that feed into the main chain from the side
  Phones and iPads show the main chain as a vertical list, with side inputs as
  "merges with" links on the step they join. Desktop draws both in two rows.
*/

const byId = (pipeline) => new Map(pipeline.steps.map((s) => [s.id, s]))

/** Longest distance from any source, per step. Sources are 0. */
export function depths(pipeline) {
  const steps = byId(pipeline)
  const memo = new Map()
  const depth = (id) => {
    if (!memo.has(id)) {
      const step = steps.get(id)
      memo.set(id, step.inputs.length ? 1 + Math.max(...step.inputs.map(depth)) : 0)
    }
    return memo.get(id)
  }
  pipeline.steps.forEach((s) => depth(s.id))
  return memo
}

export function mainChain(pipeline) {
  const steps = byId(pipeline)
  const d = depths(pipeline)
  const consumed = new Set(pipeline.steps.flatMap((s) => s.inputs))
  let current = pipeline.steps.find((s) => !consumed.has(s.id)) // the final step
  const chain = [current]
  while (current.inputs.length) {
    // Walk back along the deepest input; ties go to the first-listed input.
    const next = [...current.inputs].sort((a, b) => d.get(b) - d.get(a))[0]
    current = steps.get(next)
    chain.unshift(current)
  }
  return chain
}

/** For each main-chain step, the side steps that merge into it. */
export function sideInputs(pipeline) {
  const chainIds = new Set(mainChain(pipeline).map((s) => s.id))
  const steps = byId(pipeline)
  const result = new Map()
  for (const step of pipeline.steps) {
    if (!chainIds.has(step.id)) continue
    const sides = step.inputs.filter((i) => !chainIds.has(i)).map((i) => steps.get(i))
    if (sides.length) result.set(step.id, sides)
  }
  return result
}

/**
 * Desktop grid positions: main chain in row 0, one column per step;
 * each side input sits in row 1, in the column just before the step it joins.
 */
export function gridLayout(pipeline) {
  const chain = mainChain(pipeline)
  const positions = new Map(chain.map((s, i) => [s.id, { col: i, row: 0 }]))
  for (const [consumerId, sides] of sideInputs(pipeline)) {
    const col = positions.get(consumerId).col - 1
    sides.forEach((side, i) => positions.set(side.id, { col: Math.max(col, 0), row: 1 + i }))
  }
  const rows = 1 + Math.max(0, ...[...positions.values()].map((p) => p.row))
  return { positions, columns: chain.length, rows }
}

export function edges(pipeline) {
  return pipeline.steps.flatMap((s) => s.inputs.map((from) => ({ from, to: s.id })))
}

/*
  What a connector looks like depends on the step data flows out of:
    succeeded  solid slate line, labelled with the rows it passed on
    running    blue, data is moving
    failed     red, nothing passed on
    waiting    dashed grey, has not run
*/
export function edgeState(fromStep) {
  return fromStep.status
}

export function stepIcon(step) {
  if (step.kind === 'source') {
    if (step.target.endsWith('.xlsx')) return FileXls
    if (step.target.endsWith('.csv')) return FileCsv
    if (/api/i.test(step.target)) return Plug
    return Database
  }
  return {
    filter: Funnel,
    clean: Eraser,
    join: GitMerge,
    aggregate: Sigma,
    calculate: Calculator,
    publish: SquaresFour,
  }[step.kind]
}

/** Can this step be lightly edited from a phone? */
export const isEditable = (step) => step.kind === 'filter' && Array.isArray(step.config?.statuses)
