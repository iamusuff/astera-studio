import { ChartColumn, ChevronRight, TrendingDown, TriangleAlert } from 'lucide-react'

import { getAnswer, STARTER_QUESTIONS } from '../../data/chat.js'
import { useActions } from '../../state/AppStore.jsx'

// Each starter gets an iOS Settings-style icon tile, so the list scans at a glance.
const ICONS = {
  'missed-target': { icon: TriangleAlert, tile: 'from-[#ff9f0a] to-[#ff7a00]' },
  'west-trend': { icon: TrendingDown, tile: 'from-[#5e5ce6] to-[#4644c9]' },
  'by-category': { icon: ChartColumn, tile: 'from-[#30b0ff] to-[#007aff]' },
}

// An empty chat is an invitation to act: real questions, one tap each.
export default function EmptyChat() {
  const { ask } = useActions()
  return (
    <div className="pt-2 md:pt-6">
      <h2 className="px-1 text-[13px] font-semibold text-ink-muted">Try asking</h2>
      <ul className="mt-2 overflow-hidden rounded-[var(--radius-group)] bg-surface shadow-[var(--shadow-card)]">
        {STARTER_QUESTIONS.map((id, i) => {
          const { question } = getAnswer(id)
          const { icon: Icon, tile } = ICONS[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => ask(question, id)}
                className="flex min-h-14 w-full items-center gap-3.5 pl-4 text-left transition-colors hover:bg-sunken/50 active:bg-sunken"
              >
                <span className={`grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-gradient-to-b text-white ${tile}`}>
                  <Icon className="size-[17px]" strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span
                  className={`flex min-h-14 flex-1 items-center gap-2 py-3 pr-3 ${i > 0 ? 'border-t border-line' : ''}`}
                >
                  <span className="flex-1 text-[15px]">{question}</span>
                  <ChevronRight className="size-[18px] shrink-0 text-ink-faint" strokeWidth={2.2} aria-hidden="true" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 px-1 text-[13px] text-ink-muted">
        Studio answers with a chart and a short summary, and shows which pipeline every number came from.
      </p>
    </div>
  )
}
