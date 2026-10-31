import { SquarePen } from 'lucide-react'

import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import { useStore } from '../../state/AppStore.jsx'
import ChatContextRail from './ChatContextRail.jsx'
import Composer from './Composer.jsx'
import EmptyChat from './EmptyChat.jsx'
import MessageList from './MessageList.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

/*
  Layout per device:
    phone    one column; the composer sits just above the tab bar
    iPad     one wider column; the composer at the bottom of the screen
    desktop  the conversation plus a right rail with pinned answers and data sources
*/
export default function ChatScreen() {
  useDocumentTitle('Chat')
  const { state, actions } = useStore()
  const messages = state.chat
  const thinking = messages.some((m) => m.status === 'thinking')

  return (
    <div className="flex">
      <div className="flex min-h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px))] min-w-0 flex-1 flex-col md:min-h-dvh">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
          <PageHeader
            title="Chat"
            description="Ask about Halden’s sales, targets and regions."
            actions={
              messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={actions.clearChat} disabled={thinking}>
                  <SquarePen className="size-[18px] md:size-4" aria-hidden="true" />
                  <span className="max-md:sr-only">New chat</span>
                </Button>
              )
            }
          />
          <div className="flex-1 px-4 pb-6 md:px-8">
            {messages.length === 0 ? <EmptyChat /> : <MessageList messages={messages} />}
          </div>
          <Composer disabled={thinking} />
        </div>
      </div>
      <ChatContextRail />
    </div>
  )
}
