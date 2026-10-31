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
      {/* Skip link: first thing a keyboard user reaches. It focuses <main> directly,
          because a plain #main link would change the hash route. */}
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="sr-only z-50 rounded-lg bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Sidebar />
      <IconRail />

      {/* Bottom padding on phones keeps content clear of the fixed tab bar */}
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Outlet />
      </main>

      <TabBar />
    </div>
  )
}
