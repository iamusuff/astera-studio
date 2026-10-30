import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'

import { PIPELINES } from '../data/pipelines.js'
import { now } from '../lib/clock.js'
import * as pipelineOps from './pipelineReducer.js'

/*
  The app's shared memory. One store means an action on one screen shows up on
  the others: approve a fix and re-run on the pipeline screen, and the dashboard's
  "data may be out of date" warning disappears.

  Plain React (Context + useReducer) on purpose: the state is small and there is
  no server, so a state library would add nothing.

  Undo: each undoable action saves a snapshot of what it changed, tagged with an
  id. Undo only restores if that id is still the latest change, so an old toast's
  Undo button can never roll back a newer change.
*/

const initialState = {
  pipelines: PIPELINES,
  pins: [], // [{ id, answerId, pinnedAt }]
  filters: { period: 'q3', region: 'all' },
  undo: null, // { id, pipelines, pins }
}

const RUN_TICK_MS = 1100 // a demo run takes a few seconds, not a few minutes

function withUndo(state, undoId) {
  return { id: undoId, pipelines: state.pipelines, pins: state.pins }
}

function mapPipeline(state, id, fn) {
  return { ...state, pipelines: state.pipelines.map((p) => (p.id === id ? fn(p) : p)) }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } }

    case 'PIN':
      if (state.pins.some((p) => p.answerId === action.answerId)) return state
      return {
        ...state,
        undo: withUndo(state, action.undoId),
        pins: [...state.pins, { id: action.undoId, answerId: action.answerId, pinnedAt: action.at }],
      }

    case 'UNPIN':
      return {
        ...state,
        undo: withUndo(state, action.undoId),
        pins: state.pins.filter((p) => p.answerId !== action.answerId),
      }

    case 'EDIT_STEP':
      return {
        ...mapPipeline(state, action.pipelineId, (p) => pipelineOps.editStep(p, action)),
        undo: withUndo(state, action.undoId),
      }

    case 'EDIT_SCHEDULE':
      return {
        ...mapPipeline(state, action.pipelineId, (p) => pipelineOps.editSchedule(p, action)),
        undo: withUndo(state, action.undoId),
      }

    case 'APPLY_FIX':
      return {
        ...mapPipeline(state, action.pipelineId, (p) => pipelineOps.applyFix(p, action)),
        undo: withUndo(state, action.undoId),
      }

    // Runs are not undoable: you can't un-run a pipeline. Starting one clears undo.
    case 'RUN_START':
      return { ...mapPipeline(state, action.pipelineId, (p) => pipelineOps.startRun(p, action)), undo: null }

    case 'RUN_TICK':
      return mapPipeline(state, action.pipelineId, (p) => pipelineOps.tickRun(p, action))

    case 'UNDO':
      if (state.undo?.id !== action.undoId) return state
      return { ...state, pipelines: state.undo.pipelines, pins: state.undo.pins, undo: null }

    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

const StoreContext = createContext(null)

let counter = 0
const newId = (prefix) => `${prefix}-${++counter}`
const stamp = () => now().toISOString()

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // The run timer reads the latest state through a ref, so it never acts on a stale copy.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  const timers = useRef(new Map())
  useEffect(() => {
    const active = timers.current
    return () => active.forEach(clearInterval)
  }, [])

  // Actions return the undo id, so a toast's Undo button can pass it back.
  const actions = useMemo(
    () => ({
      setFilter: (key, value) => dispatch({ type: 'SET_FILTER', key, value }),

      pin: (answerId) => {
        const undoId = newId('pin')
        dispatch({ type: 'PIN', answerId, undoId, at: stamp() })
        return undoId
      },
      unpin: (answerId) => {
        const undoId = newId('unpin')
        dispatch({ type: 'UNPIN', answerId, undoId })
        return undoId
      },

      editStep: (pipelineId, stepId, config, summary) => {
        const undoId = newId('edit')
        dispatch({ type: 'EDIT_STEP', pipelineId, stepId, config, summary, undoId, at: stamp() })
        return undoId
      },
      editSchedule: (pipelineId, schedule) => {
        const undoId = newId('schedule')
        dispatch({ type: 'EDIT_SCHEDULE', pipelineId, schedule, undoId })
        return undoId
      },
      applyFix: (pipelineId, stepId) => {
        const undoId = newId('fix')
        dispatch({ type: 'APPLY_FIX', pipelineId, stepId, undoId, at: stamp() })
        return undoId
      },

      rerun: (pipelineId, fromStepId) => {
        if (timers.current.has(pipelineId)) return
        dispatch({ type: 'RUN_START', pipelineId, fromStepId, runId: newId('run'), at: stamp() })
        const timer = setInterval(() => {
          dispatch({ type: 'RUN_TICK', pipelineId, at: stamp() })
          const pipeline = stateRef.current.pipelines.find((p) => p.id === pipelineId)
          if (pipeline.status !== 'running') {
            clearInterval(timer)
            timers.current.delete(pipelineId)
          }
        }, RUN_TICK_MS)
        timers.current.set(pipelineId, timer)
      },

      undo: (undoId) => dispatch({ type: 'UNDO', undoId }),
    }),
    [],
  )

  const value = useMemo(() => ({ state, actions }), [state, actions])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <AppStoreProvider>')
  return store
}

// Small selectors so screens don't repeat lookups.
export const usePipelines = () => useStore().state.pipelines
export const usePipeline = (id) => useStore().state.pipelines.find((p) => p.id === id)
export const useActions = () => useStore().actions

/** A pipeline's charts are stale when its latest run failed: they still show older data. */
export const isStale = (pipeline) => pipeline.status === 'failed'
