import { MotionConfig, motion } from 'motion/react'
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router'

import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import Sidebar from './Sidebar.jsx'
import TabBar from './TabBar.jsx'

/*
  One shell, two navigation patterns, chosen by width like iPadOS size classes:
    < 1024px   floating glass tab bar (iPhone, iPad portrait)
    >= 1024px  translucent sidebar that can be collapsed (iPad landscape, Mac)

  Page transitions follow iOS: going deeper slides in from the right, going
  back slides in from the left, switching tabs cross-fades. Springs, not
  fixed durations, and all of it is skipped under "reduce motion".

  Keyboard (desktop):  /  ask a question     [  show or hide the sidebar
*/
const LayoutContext = createContext({ sidebarOpen: false, canToggle: false, toggleSidebar: () => {} })
export const useLayout = () => useContext(LayoutContext)

const PAGE_SPRING = { type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }

function readSidebar() {
  try {
    return localStorage.getItem('astera-sidebar') !== 'closed'
  } catch {
    return true
  }
}

export default function AppShell() {
  const wide = useMediaQuery('(min-width: 1024px)')
  const [sidebarPref, setSidebarPref] = useState(readSidebar)
  const navigate = useNavigate()
  const location = useLocation()
  const outlet = useOutlet()

  const toggleSidebar = useCallback(() => {
    setSidebarPref((open) => {
      try {
        localStorage.setItem('astera-sidebar', open ? 'closed' : 'open')
      } catch {
        /* not remembered, that's fine */
      }
      return !open
    })
  }, [])

  // Direction of travel decides the transition: deeper, shallower or sideways.
  const depth = location.pathname.split('/').filter(Boolean).length
  const previous = useRef({ path: location.pathname, depth })
  const from = previous.current
  const enter =
    from.path === location.pathname
      ? { opacity: 0 }
      : depth > from.depth
        ? { opacity: 0, x: 32 }
        : depth < from.depth
          ? { opacity: 0, x: -32 }
          : { opacity: 0, y: 10 }

  useLayoutEffect(() => {
    previous.current = { path: location.pathname, depth }
    window.scrollTo(0, 0)
  }, [location.pathname, depth])

  useEffect(() => {
    function onKey(event) {
      const typing = /input|textarea|select/i.test(event.target.tagName) || event.target.isContentEditable
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === '/') {
        event.preventDefault()
        navigate('/chat')
        setTimeout(() => document.getElementById('chat-question')?.focus(), 60)
      } else if (event.key === '[' && wide) {
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, toggleSidebar, wide])

  const layout = useMemo(
    () => ({ sidebarOpen: wide && sidebarPref, canToggle: wide, toggleSidebar }),
    [wide, sidebarPref, toggleSidebar],
  )

  return (
    <MotionConfig reducedMotion="user">
      <LayoutContext.Provider value={layout}>
        {/* data-vaul-drawer-wrapper: lets bottom sheets shrink the page back, like iOS */}
        <div data-vaul-drawer-wrapper="" className="min-h-dvh bg-paper lg:flex">
          {/* Skip link: first thing a keyboard user reaches. It focuses <main> directly,
              because a plain #main link would change the hash route. */}
          <a
            href="#main"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('main')?.focus()
            }}
            className="sr-only z-50 rounded-xl bg-tint px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>

          {wide && <Sidebar open={layout.sidebarOpen} />}

          {/* Bottom padding below 1024px keeps content clear of the floating tab bar */}
          <main
            id="main"
            tabIndex={-1}
            className="min-w-0 flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] outline-none lg:pb-0"
          >
            <motion.div key={location.pathname} initial={enter} animate={{ opacity: 1, x: 0, y: 0 }} transition={PAGE_SPRING}>
              {outlet}
            </motion.div>
          </main>

          {!wide && <TabBar />}
        </div>
      </LayoutContext.Provider>
    </MotionConfig>
  )
}
