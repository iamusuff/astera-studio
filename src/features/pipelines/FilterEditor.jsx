import { Check } from 'lucide-react'
import { useState } from 'react'

import Button from '../../components/ui/Button.jsx'
import { notify } from '../../components/ui/notify.jsx'
import { ORDER_STATUS_OPTIONS } from '../../data/pipelines.js'
import { formatNumber } from '../../lib/format.js'
import { useActions } from '../../state/AppStore.jsx'

const rowsFor = (statuses) =>
  ORDER_STATUS_OPTIONS.filter((o) => statuses.includes(o.id)).reduce((total, o) => total + o.rows, 0)

const listLabels = (ids) => {
  const labels = ORDER_STATUS_OPTIONS.filter((o) => ids.includes(o.id)).map((o) => o.label.toLowerCase())
  return labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}` : labels[0]
}

/*
  A light edit that is safe on a phone: choose which orders the filter keeps.
  Before saving you see what the change does ("195,436 -> 209,651 rows").
  Saving doesn't touch the data; it applies on the next run, and can be undone.
*/
export default function FilterEditor({ pipeline, step }) {
  const { editStep, undo, rerun } = useActions()
  const saved = step.config.statuses
  const [statuses, setStatuses] = useState(saved)
  const changed = statuses.length !== saved.length || statuses.some((s) => !saved.includes(s))
  const before = rowsFor(saved)
  const after = rowsFor(statuses)
  const diff = after - before

  function toggle(id) {
    setStatuses((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]))
  }

  function save() {
    const undoId = editStep(pipeline.id, step.id, { statuses }, `now keeps ${listLabels(statuses)} orders`)
    notify({
      title: 'Filter updated',
      success: true,
      description: 'Applies on the next run.',
      secondary: { label: 'Re-run now', onClick: () => rerun(pipeline.id, step.id) },
      action: { label: 'Undo', onClick: () => undo(undoId) },
      duration: 8000,
    })
  }

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold">Keep Q3 orders that are</legend>
        <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
          {ORDER_STATUS_OPTIONS.map((option) => {
            const checked = statuses.includes(option.id)
            return (
              <li key={option.id}>
                <label className="flex min-h-12 cursor-pointer items-center gap-3 px-3.5 py-2">
                  <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(option.id)} />
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tint ${
                      checked ? 'border-tint bg-tint text-white' : 'border-line-strong bg-surface'
                    }`}
                    aria-hidden="true"
                  >
                    {checked && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">{option.label}</span>
                  <span className="text-sm text-ink-muted tabular-nums">{formatNumber(option.rows)}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <div aria-live="polite" className="rounded-xl bg-sunken px-4 py-3 text-sm">
        {statuses.length === 0 ? (
          <p className="text-fail">Keep at least one kind of order, or the dashboard would have no data.</p>
        ) : changed ? (
          <p>
            Rows passed on:{' '}
            <span className="tabular-nums">
              {formatNumber(before)} → <span className="font-semibold">{formatNumber(after)}</span>
            </span>{' '}
            <span className="text-ink-muted tabular-nums">
              ({diff > 0 ? '+' : '−'}
              {formatNumber(Math.abs(diff))})
            </span>
          </p>
        ) : (
          <p className="text-ink-muted">Rows passed on: {formatNumber(before)}. Change a setting to preview its effect.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={save} disabled={!changed || statuses.length === 0}>
          Save change
        </Button>
        {changed && (
          <Button variant="ghost" onClick={() => setStatuses(saved)}>
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
