import PageHeader from '../../components/layout/PageHeader.jsx'
import ScreenPlaceholder from '../../components/layout/ScreenPlaceholder.jsx'

export default function ChatScreen() {
  return (
    <>
      <PageHeader title="Chat" description="Ask a question about your data and get a chart you can pin." />
      <ScreenPlaceholder phase={3} />
    </>
  )
}
