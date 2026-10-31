import { motion } from 'motion/react'
import { PanelLeft } from 'lucide-react'
import { NavLink } from 'react-router'

import { usePipelines } from '../../state/AppStore.jsx'
import Logo from '../brand/Logo.jsx'
import AppearanceControl from './AppearanceControl.jsx'
import { useLayout } from './AppShell.jsx'
import NavBadge, { useFailedCount } from './NavBadge.jsx'
import { navItems } from './navItems.js'

const STATUS_DOT = {
  succeeded: 'bg-ok-dot',
  running: 'bg-run-dot',
  failed: 'bg-fail-dot',
  scheduled: 'bg-line-strong',
}

/*
  Mac and iPad landscape: a translucent sidebar, like Finder or Mail.
  Besides the three sections it lists every pipeline with a status dot, so a
  failure is visible, and one click away, from anywhere in the app.
  It collapses with a spring (toolbar button or the [ key).
*/
export default function Sidebar({ open }) {
  const { toggleSidebar } = useLayout()
  const failed = useFailedCount()
  const pipelines = usePipelines()

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: open ? 264 : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 42 }}
      className="sticky top-0 h-dvh shrink-0 overflow-hidden"
      inert={!open || undefined}
    >
      <div className="glass-bar flex h-full w-[264px] flex-col border-r border-line">
        <div className="flex h-[52px] items-center justify-between pr-2 pl-4">
          <Logo />
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Hide sidebar"
            title="Hide sidebar ( [ )"
            className="grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            <PanelLeft className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="mt-3 flex flex-col gap-0.5 px-2.5">
          {navItems.map(({ to, label, icon: Icon, showFailedCount }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-[14px] transition-colors ${
                  isActive ? 'bg-sunken font-semibold' : 'hover:bg-sunken/60'
                }`
              }
            >
              <Icon className="size-[18px] text-tint-text" strokeWidth={1.9} aria-hidden="true" />
              {label}
              {showFailedCount && <NavBadge count={failed} className="ml-auto" />}
            </NavLink>
          ))}
        </nav>

        <section aria-labelledby="sidebar-pipelines" className="mt-6 px-2.5">
          <h2 id="sidebar-pipelines" className="px-2.5 pb-1 text-xs font-semibold text-ink-muted">
            Pipelines
          </h2>
          <ul className="flex flex-col gap-0.5">
            {pipelines.map((p) => (
              <li key={p.id}>
                <NavLink
                  to={`/pipelines/${p.id}`}
                  className={({ isActive }) =>
                    `flex h-8 items-center gap-2.5 rounded-[9px] px-2.5 text-[13px] transition-colors ${
                      isActive ? 'bg-sunken font-semibold' : 'text-ink-muted hover:bg-sunken/60 hover:text-ink'
                    }`
                  }
                >
                  <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[p.status]}`} aria-hidden="true" />
                  <span className="truncate">{p.name}</span>
                  <span className="sr-only">, {p.status}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-auto space-y-3 border-t border-line p-4">
          <AppearanceControl />
          <div className="flex items-center gap-3">
            <Avatar />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold">Muhammad Yousuf</span>
              <span className="block truncate text-xs text-ink-muted">Halden Outfitters</span>
            </span>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export function Avatar({ className = 'size-8 text-xs' }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#8e8e93] to-[#636366] font-semibold text-white ${className}`}
      aria-hidden="true"
    >
      MY
    </span>
  )
}
