import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'

import AppShell from './components/layout/AppShell.jsx'
import ChatScreen from './features/chat/ChatScreen.jsx'
import DashboardScreen from './features/dashboard/DashboardScreen.jsx'
import RegionScreen from './features/dashboard/RegionScreen.jsx'
import PipelinesScreen from './features/pipelines/PipelinesScreen.jsx'
import PipelineDetailScreen from './features/pipelines/PipelineDetailScreen.jsx'
import DevicePreview from './features/preview/DevicePreview.jsx'
import { AppStoreProvider } from './state/AppStore.jsx'
import { ThemeProvider, useTheme } from './state/theme.jsx'
import { useIsDesktop } from './hooks/useMediaQuery.js'

// HashRouter (#/chat, #/dashboard, ...) is used instead of normal URLs because
// there is no server: hash URLs work on GitHub Pages and when index.html is
// opened straight from the zip.
export default function App() {
  return (
    <ThemeProvider>
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
          {/* For reviewers: the app at three device sizes. Outside the app shell on purpose. */}
          <Route path="preview" element={<DevicePreview />} />
        </Routes>
      </HashRouter>

      <AppToaster />
    </AppStoreProvider>
    </ThemeProvider>
  )
}

/*
  One toaster for the whole app. On phones and iPads toasts come from the top,
  like iOS notifications, because the bottom of a touch screen is already busy
  with the tab bar, bottom sheets and the chat input. On desktop: bottom right.
*/
function AppToaster() {
  const isDesktop = useIsDesktop()
  const { theme } = useTheme()
  return (
    <Toaster
      theme={theme}
      position={isDesktop ? 'bottom-right' : 'top-center'}
      offset={{ top: '16px', bottom: '24px', right: '24px' }}
      mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 8px)', left: '12px', right: '12px' }}
      gap={8}
    />
  )
}
