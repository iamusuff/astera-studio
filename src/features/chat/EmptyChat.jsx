import { MessageSquare } from 'lucide-react'

import { getAnswer, STARTER_QUESTIONS } from '../../data/chat.js'
import { useActions } from '../../state/AppStore.jsx'

// An empty chat is an invitation to act: real questions, one tap each.
export default function EmptyChat() {
  const { ask } = useActions()
  return (
    <div className="pt-4 md:pt-10">
      <h2 className="text-lg font-semibold">Start with a question</h2>
      <p className="mt-1 max-w-[52ch] text-ink-muted">
        Studio answers with a chart and a short summary, and shows which pipeline each number came from.
      </p>
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {STARTER_QUESTIONS.map((id) => {
          const { question } = getAnswer(id)
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => ask(question, id)}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sunken/60 active:bg-sunken"
              >
                <MessageSquare className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} aria-hidden="true" />
                {question}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
