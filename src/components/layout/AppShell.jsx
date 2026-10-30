import { Outlet } from 'react-router'

import Sidebar from './Sidebar.jsx'
import IconRail from './IconRail.jsx'
import TabBar from './TabBar.jsx'

/*
  One shell, three navigation patterns. Which one shows is decided by CSS
  breakpoints only (no JavaScript), so there is no flash of the wrong layout:

    phone   < 768px      bottom tab bar (thumb reach, like native iOS apps)
    iPad    768-1279px   slim icon rail (keeps width for content in split views)
    desktop >= 1280px    full sidebar with labels
*/
export default function AppShell() {
  return (
    <div className="min-h-dvh md:flex">
      <Sidebar />
      <IconRail />

      {/* Bottom padding on phones keeps content clear of the fixed tab bar */}
      <main className="min-w-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Outlet />
      </main>

      <TabBar />
    </div>
  )
}
