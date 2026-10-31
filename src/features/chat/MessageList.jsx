import { useEffect, useRef } from 'react'

import { LogoMark } from '../../components/brand/Logo.jsx'
import { StatusIcon } from '../../components/ui/StatusBadge.jsx'
import { getAnswer, STARTER_QUESTIONS } from '../../data/chat.js'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { usePipeline } from '../../state/AppStore.jsx'
import AnswerMessage from './AnswerMessage.jsx'
import SuggestionChips from './SuggestionChips.jsx'

export default function MessageList({ messages }) {
  const lastRef = useRef(null)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const last = messages.at(-1)

  // Bring each new question to the top of the screen, so its answer appears right under it.
  // The latest message gets a minimum height so there is always room to scroll it up.
  useEffect(() => {
    lastRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [messages.length, reduceMotion])

  const asked = new Set(messages.map((m) => m.answerId))

  return (
    <ol className="space-y-8" aria-label="Conversation">
      {messages.map((m) => (
        <li key={m.id} ref={m === last ? lastRef : null} className={`scroll-mt-4 space-y-4 ${m === last ? 'min-h-[calc(100dvh-14rem)]' : ''}`}>
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-sunken px-4 py-2.5 break-words">{m.question}</p>
          {m.status === 'thinking' && <Thinking answerId={m.answerId} />}
          {m.status === 'done' && (m.answerId ? <AnswerMessage answerId={m.answerId} /> : <NoAnswer />)}
          {m === last && m.status === 'done' && m.answerId && (
            <SuggestionChips ids={getAnswer(m.answerId).followUps.filter((id) => !asked.has(id))} />
          )}
        </li>
      ))}
    </ol>
  )
}

// Says what Studio is doing, in the same words as the source line it will show.
function Thinking({ answerId }) {
  const pipeline = usePipeline(answerId ? getAnswer(answerId).pipelineId : null)
  return (
    <div className="flex items-center gap-3 text-ink-muted transition-[opacity,translate] duration-200 ease-out-ui starting:translate-y-1.5 starting:opacity-0" role="status">
      <LogoMark className="hidden size-7 shrink-0 md:block" />
      <StatusIcon status="running" />
      {pipeline ? `Reading the ${pipeline.name} pipeline…` : 'Looking for an answer…'}
    </div>
  )
}

// No fake answers: say so plainly and offer questions that do work.
function NoAnswer() {
  return (
    <div className="flex gap-3 transition-[opacity,translate] duration-200 ease-out-ui starting:translate-y-1.5 starting:opacity-0">
      <LogoMark className="hidden size-7 shrink-0 md:block" />
      <div className="min-w-0 flex-1 space-y-3">
        <p className="max-w-[65ch]">
          I can’t answer that in this demo. These questions use the same sales data:
        </p>
        <SuggestionChips ids={STARTER_QUESTIONS} />
      </div>
    </div>
  )
}
