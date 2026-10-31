import { ArrowUp } from 'lucide-react'
import { useState } from 'react'

import { useActions } from '../../state/AppStore.jsx'

// Question input. Sticks to the bottom of the screen (above the tab bar on phones).
// 16px text stops iOS zooming in; enterKeyHint shows "Send" on the phone keyboard.
export default function Composer({ disabled }) {
  const { ask } = useActions()
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0 && !disabled

  function onSubmit(event) {
    event.preventDefault()
    if (!canSend) return
    ask(text.trim())
    setText('')
  }

  return (
    <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] bg-paper px-4 pt-2 pb-3 md:bottom-0 md:px-8 md:pb-6">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface py-1.5 pr-1.5 pl-4 focus-within:border-ink"
      >
        <label htmlFor="chat-question" className="sr-only">
          Ask a question about your data
        </label>
        <input
          id="chat-question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about sales, targets or regions"
          autoComplete="off"
          enterKeyHint="send"
          className="h-10 min-w-0 flex-1 bg-transparent placeholder:text-ink-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Ask"
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-ink text-white transition-[transform,opacity] duration-150 active:scale-[0.94] disabled:opacity-30"
        >
          <ArrowUp className="size-5" strokeWidth={2} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
