import { NotePencil } from '@phosphor-icons/react'

import { useLayout } from '../../components/layout/AppShell.jsx'
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

  The conversation keeps a comfortable reading width, centered. The toolbar
  above it spans the whole page (sidebar button at the left edge, as on every
  screen), and the title lines up with the messages. Hiding the sidebar
  widens the conversation a step, easing along with the sidebar.
*/
export default function ChatScreen() {
  useDocumentTitle('Chat')
  const { state, actions } = useStore()
  const { sidebarOpen } = useLayout()
  const messages = state.chat
  const thinking = messages.some((m) => m.status === 'thinking')
  const column = `mx-auto w-full transition-[max-width] duration-500 ease-drawer ${sidebarOpen ? 'max-w-3xl' : 'max-w-4xl'}`

  return (
    <div className="flex">
      <div className="flex min-h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px))] min-w-0 flex-1 flex-col md:min-h-dvh">
        <PageHeader
          title="Chat"
          description="Ask about Halden’s sales, targets and regions."
          contentClassName={`${column} px-4 md:px-8`}
          actions={
            messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={actions.clearChat} disabled={thinking}>
                <NotePencil className="size-[18px] md:size-4" aria-hidden="true" />
                <span className="max-md:sr-only">New chat</span>
              </Button>
            )
          }
        />
        <div className={`${column} flex flex-1 flex-col`}>
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
