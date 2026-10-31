import { PinOff } from 'lucide-react'
import { Link } from 'react-router'

import ChartPanel from '../../components/charts/ChartPanel.jsx'
import Button from '../../components/ui/Button.jsx'
import { notify } from '../../components/ui/notify.jsx'
import { getAnswer } from '../../data/chat.js'
import { useStore } from '../../state/AppStore.jsx'

// Answers pinned from Chat. They keep the question's own date range (shown in the
// subtitle), so changing the dashboard filters doesn't silently change what was pinned.
export default function PinnedAnswers() {
  const { state, actions } = useStore()

  return (
    <section aria-labelledby="pinned-heading" className="space-y-3">
      <h2 id="pinned-heading" className="text-sm font-semibold">
        Pinned from chat
      </h2>
      {state.pins.length === 0 ? (
        <p className="rounded-[var(--radius-group)] border border-dashed border-line-strong px-4 py-5 text-sm text-ink-muted">
          Answers you pin in{' '}
          <Link to="/chat" className="font-semibold text-tint-text">
            Chat
          </Link>{' '}
          appear here and refresh with their pipeline.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.pins.map((pin) => {
            const answer = getAnswer(pin.answerId)
            const unpin = () => {
              const undoId = actions.unpin(answer.id)
              notify({
                title: 'Removed from dashboard',
                description: answer.title,
                action: { label: 'Undo', onClick: () => actions.undo(undoId) },
              })
            }
            return (
              <ChartPanel
                key={pin.id}
                chart={{ ...answer, spec: answer.chart, table: { ...answer.table, flagKey: 'missed' } }}
                staleNotice={false}
                actions={
                  <Button variant="ghost" size="icon" aria-label={`Unpin ${answer.title}`} title="Unpin" onClick={unpin}>
                    <PinOff className="size-[18px]" aria-hidden="true" />
                  </Button>
                }
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
