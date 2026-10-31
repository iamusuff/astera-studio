import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'

import { matchQuestion } from '../data/chat.js'
import { PIPELINES } from '../data/pipelines.js'
import { now } from '../lib/clock.js'
import * as pipelineOps from './pipelineReducer.js'

/*
  The app's shared memory. One store means an action on one screen shows up on
  the others: approve a fix and re-run on the pipeline screen, and the dashboard's
  "data may be out of date" warning disappears.

  Plain React (Context + useReducer) on purpose: the state is small and there is
  no server, so a state library would add nothing.

  Undo: each undoable action saves only what it changed (the pins, one step,
  or one schedule), tagged with an id. Undo puts back just that, so it can never
  roll back something else, like a run that finished in the meantime. It only
  works while that id is still the latest change, so an old toast's Undo button
  can never undo a newer change. Starting a run clears it: you can't un-run.
*/

const initialState = {
  pipelines: PIPELINES,
  pins: [], // [{ id, answerId, pinnedAt }]
  filters: { period: 'q3', region: 'all' },
  chat: [], // [{ id, question, answerId, status: 'thinking' | 'done' }]
  undo: null, // { id, pins, pipelineId?, step?, schedule? }
  epoch: 0, // goes up on every reset, so screens can tell a reset from a real status change
}

const RUN_TICK_MS = 1100 // a demo run takes a few seconds, not a few minutes
const THINKING_MS = 1200 // long enough to read "Reading the Regional sales pipeline"

// What undo needs to put back. `step` / `schedule` are the values before the change.
function withUndo(state, undoId, { pipelineId, stepId, schedule = false } = {}) {
  const pipeline = pipelineId && state.pipelines.find((p) => p.id === pipelineId)
  return {
    id: undoId,
    pins: state.pins,
    pipelineId,
    step: stepId ? pipeline.steps.find((s) => s.id === stepId) : null,
    schedule: schedule ? pipeline.schedule : null,
  }
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
        undo: withUndo(state, action.undoId, { pipelineId: action.pipelineId, stepId: action.stepId }),
      }

    case 'EDIT_SCHEDULE':
      return {
        ...mapPipeline(state, action.pipelineId, (p) => pipelineOps.editSchedule(p, action)),
        undo: withUndo(state, action.undoId, { pipelineId: action.pipelineId, schedule: true }),
      }

    case 'APPLY_FIX':
      return {
        ...mapPipeline(state, action.pipelineId, (p) => pipelineOps.applyFix(p, action)),
        undo: withUndo(state, action.undoId, { pipelineId: action.pipelineId, stepId: action.stepId }),
      }

    // Runs are not undoable: you can't un-run a pipeline. Starting one clears undo.
    case 'RUN_START':
      return { ...mapPipeline(state, action.pipelineId, (p) => pipelineOps.startRun(p, action)), undo: null }

    case 'RUN_TICK':
      return mapPipeline(state, action.pipelineId, (p) => pipelineOps.tickRun(p, action))

    case 'CHAT_ASK':
      return {
        ...state,
        chat: [...state.chat, { id: action.id, question: action.question, answerId: action.answerId, status: 'thinking' }],
      }

    case 'CHAT_ANSWER':
      return { ...state, chat: state.chat.map((m) => (m.id === action.id ? { ...m, status: 'done' } : m)) }

    case 'CHAT_CLEAR':
      return { ...state, chat: [] }

    // Settings > Reset demo data: everything back to how the demo starts.
    case 'RESET':
      return { ...initialState, epoch: state.epoch + 1 }

    case 'UNDO': {
      const saved = state.undo
      if (saved?.id !== action.undoId) return state
      let next = { ...state, pins: saved.pins, undo: null }
      if (saved.schedule) next = mapPipeline(next, saved.pipelineId, (p) => ({ ...p, schedule: saved.schedule }))
      if (saved.step) {
        next = mapPipeline(next, saved.pipelineId, (p) => ({
          ...p,
          steps: p.steps.map((s) => (s.id === saved.step.id ? saved.step : s)),
        }))
      }
      return next
    }

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

      // answerId is known when a suggestion chip is tapped; typed questions are matched
      // by keywords, and null means "no answer in this demo".
      ask: (question, answerId = matchQuestion(question)) => {
        const id = newId('msg')
        dispatch({ type: 'CHAT_ASK', id, question, answerId })
        setTimeout(() => dispatch({ type: 'CHAT_ANSWER', id }), THINKING_MS)
        return id
      },
      clearChat: () => dispatch({ type: 'CHAT_CLEAR' }),

      // Stop simulated runs first, so a timer can't tick on the fresh data.
      reset: () => {
        timers.current.forEach(clearInterval)
        timers.current.clear()
        dispatch({ type: 'RESET' })
      },
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
