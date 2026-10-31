import { Link } from 'react-router'

import Freshness from '../../components/ui/Freshness.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { getAnswer } from '../../data/chat.js'
import { isStale, usePipeline, useStore } from '../../state/AppStore.jsx'

/*
  Desktop only (>= 1280px), where there is room beside the conversation:
  what you've pinned, and the health of the data the chat answers from.
  On phones and iPads the same information lives on the answer cards themselves.
*/
export default function ChatContextRail() {
  const { state } = useStore()
  const sales = usePipeline('regional-sales')

  return (
    <aside
      aria-label="Chat context"
      className="sticky top-0 hidden h-dvh w-80 shrink-0 space-y-8 overflow-y-auto border-l border-line px-6 py-8 xl:block"
    >
      <section>
        <h2 className="text-sm font-semibold">Pinned to dashboard</h2>
        {state.pins.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">
            Pin an answer to keep it on the Sales overview dashboard, where it refreshes with its pipeline.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {state.pins.map((pin) => (
              <li key={pin.id} className="text-sm">
                {getAnswer(pin.answerId).title}
              </li>
            ))}
          </ul>
        )}
        {state.pins.length > 0 && (
          <Link to="/dashboard" className="mt-3 inline-block text-sm font-medium underline underline-offset-4">
            Open dashboard
          </Link>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold">Answering from</h2>
        <Link
          to={`/pipelines/${sales.id}`}
          className="mt-3 block rounded-lg border border-line bg-surface p-3 transition-colors hover:border-line-strong"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{sales.name}</span>
            <StatusBadge status={sales.status} />
          </span>
          <Freshness at={sales.lastSuccessAt} stale={isStale(sales)} className="mt-2" />
        </Link>
      </section>
    </aside>
  )
}
