import { ArrowUp } from 'lucide-react'
import { useState } from 'react'

import { useActions } from '../../state/AppStore.jsx'

/*
  The question box: a floating glass capsule, like the iOS 26 search and
  message fields. It sits just above the tab bar on iPhone/iPad portrait and at
  the bottom of the conversation on Mac. 16px text stops iOS zooming in;
  enterKeyHint shows "Send" on the phone keyboard. On Mac, "/" jumps here.
*/
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
    <div className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+82px)] z-20 px-4 pt-2 pb-3 md:px-8 lg:bottom-0 lg:pb-6">
      <form onSubmit={onSubmit} className="glass-float flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-5">
        <label htmlFor="chat-question" className="sr-only">
          Ask a question about your data
        </label>
        <input
          id="chat-question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about sales, targets or regions…"
          autoComplete="off"
          enterKeyHint="send"
          className="h-10 min-w-0 flex-1 bg-transparent placeholder:text-ink-muted focus:outline-none"
        />
        <kbd className="hidden rounded-md bg-sunken px-1.5 py-0.5 font-sans text-xs text-ink-muted pointer-fine:lg:inline" title="Press / to ask from anywhere">
          /
        </kbd>
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Ask"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-white transition-[transform,opacity] duration-200 ease-out-ui active:scale-90 disabled:bg-line-strong disabled:opacity-60"
        >
          <ArrowUp className="size-5" strokeWidth={2.4} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
