import { getAnswer } from '../../data/chat.js'
import { useActions, useStore } from '../../state/AppStore.jsx'

// Follow-up questions as one-tap chips. This is how a phone user changes a chart
// ("Show that as a percentage of target") without typing.
export default function SuggestionChips({ ids }) {
  const { ask } = useActions()
  const thinking = useStore().state.chat.some((m) => m.status === 'thinking')
  if (!ids.length) return null

  return (
    <ul aria-label="Suggested questions" className="flex flex-wrap gap-2 md:pl-10">
      {ids.map((id) => {
        const { question } = getAnswer(id)
        return (
          <li key={id}>
            <button
              type="button"
              disabled={thinking}
              onClick={() => ask(question, id)}
              className="min-h-11 rounded-full border border-line-strong bg-surface px-4 py-2 text-left text-sm transition-[transform,background-color] duration-150 hover:bg-sunken active:scale-[0.97] disabled:opacity-45 pointer-fine:min-h-9 pointer-fine:py-1.5"
            >
              {question}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
