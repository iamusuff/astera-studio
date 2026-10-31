import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'

import AppShell from './components/layout/AppShell.jsx'
import ChatScreen from './features/chat/ChatScreen.jsx'
import DashboardScreen from './features/dashboard/DashboardScreen.jsx'
import RegionScreen from './features/dashboard/RegionScreen.jsx'
import PipelinesScreen from './features/pipelines/PipelinesScreen.jsx'
import PipelineDetailScreen from './features/pipelines/PipelineDetailScreen.jsx'
import { AppStoreProvider } from './state/AppStore.jsx'
import { useIsDesktop } from './hooks/useMediaQuery.js'

// HashRouter (#/chat, #/dashboard, ...) is used instead of normal URLs because
// there is no server: hash URLs work on GitHub Pages and when index.html is
// opened straight from the zip.
export default function App() {
  return (
    <AppStoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            {/* Studio is chat-first, so chat is the home screen */}
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatScreen />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="dashboard/region/:regionId" element={<RegionScreen />} />
            <Route path="pipelines" element={<PipelinesScreen />} />
            <Route path="pipelines/:pipelineId" element={<PipelineDetailScreen />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Route>
        </Routes>
      </HashRouter>

      <AppToaster />
    </AppStoreProvider>
  )
}

/*
  One toaster for the whole app. On phones and iPads toasts come from the top,
  like iOS notifications, because the bottom of a touch screen is already busy
  with the tab bar, bottom sheets and the chat input. On desktop: bottom right.
*/
function AppToaster() {
  const isDesktop = useIsDesktop()
  return (
    <Toaster
      position={isDesktop ? 'bottom-right' : 'top-center'}
      offset={{ top: '16px', bottom: '24px', right: '24px' }}
      mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 8px)', left: '12px', right: '12px' }}
      gap={8}
    />
  )
}
