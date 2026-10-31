import { motion } from 'motion/react'
import { CaretLeft, SidebarSimple } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import AccountButton from './AccountButton.jsx'
import { useLayout } from './AppShell.jsx'

/*
  iOS large-title navigation, used by every screen.

  At the top of the page you see a large title on the page itself. Scroll it
  away and a compact, glass navigation bar fades in with the small title, like
  Settings, Mail and Music. The bar also holds the back link (iOS style, blue
  chevron), the sidebar toggle on Mac/iPad landscape, and the account avatar on
  iPhone/iPad portrait.

  Props: title, description, back { to, label }, actions (right of the large
  title), accessory (next to the title, e.g. a status badge), children (extra
  lines under the description).
*/
export default function PageHeader({ title, description, back, actions, accessory, children }) {
  const { sidebarOpen, canToggle, toggleSidebar } = useLayout()
  const wide = useMediaQuery('(min-width: 1024px)')
  const titleRef = useRef(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const el = titleRef.current
    const observer = new IntersectionObserver(([entry]) => setCollapsed(!entry.isIntersecting), {
      rootMargin: '-56px 0px 0px 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)]">
        <motion.div
          className="glass-bar absolute inset-0 border-b border-line"
          initial={false}
          animate={{ opacity: collapsed ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        />
        <div className="relative grid h-[52px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 md:px-5">
          <div className="flex min-w-0 items-center gap-1">
            {canToggle && !sidebarOpen && (
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Show sidebar"
                title="Show sidebar ( [ )"
                className="grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
              >
                <SidebarSimple className="size-[18px]" aria-hidden="true" />
              </button>
            )}
            {back && (
              <Link
                to={back.to}
                className="-ml-1 flex min-h-11 min-w-0 items-center rounded-lg pr-2 text-[17px] text-tint-text transition-opacity active:opacity-50 pointer-fine:min-h-9 pointer-fine:text-[15px]"
              >
                <CaretLeft className="size-6 shrink-0 pointer-fine:size-5" aria-hidden="true" />
                <span className="truncate">{back.label}</span>
              </Link>
            )}
          </div>

          <motion.p
            className="max-w-[48vw] truncate text-[17px] font-semibold tracking-[-0.02em] lg:max-w-md"
            initial={false}
            animate={{ opacity: collapsed ? 1 : 0, y: collapsed ? 0 : 6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            aria-hidden="true"
          >
            {title}
          </motion.p>

          <div className="flex items-center justify-end">{!wide && <AccountButton />}</div>
        </div>
      </div>

      <header className="px-4 pb-6 md:px-8 xl:px-10">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 ref={titleRef} className="text-[34px] leading-[1.1] font-bold tracking-[-0.025em] lg:text-[30px]">
                {title}
              </h1>
              {accessory}
            </div>
            {description && <p className="mt-1.5 max-w-[62ch] text-[15px] text-ink-muted md:text-base">{description}</p>}
            {children}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
    </>
  )
}
