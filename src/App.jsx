import { HashRouter, Navigate, Route, Routes } from 'react-router'

import AppShell from './components/layout/AppShell.jsx'
import ChatScreen from './features/chat/ChatScreen.jsx'
import DashboardScreen from './features/dashboard/DashboardScreen.jsx'
import PipelinesScreen from './features/pipelines/PipelinesScreen.jsx'
import PipelineDetailScreen from './features/pipelines/PipelineDetailScreen.jsx'

// HashRouter (#/chat, #/dashboard, ...) is used instead of normal URLs because
// there is no server: hash URLs work on GitHub Pages and when index.html is
// opened straight from the zip.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* Studio is chat-first, so chat is the home screen */}
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatScreen />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="pipelines" element={<PipelinesScreen />} />
          <Route path="pipelines/:pipelineId" element={<PipelineDetailScreen />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
