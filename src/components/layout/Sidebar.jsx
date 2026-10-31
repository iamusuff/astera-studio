import { motion } from 'motion/react'
import { CircleNotch, SidebarSimple, WarningCircle } from '@phosphor-icons/react'
import { NavLink } from 'react-router'

import { useNow } from '../../hooks/useNow.js'
import { formatShortAgo } from '../../lib/format.js'
import { usePipelines } from '../../state/AppStore.jsx'
import Logo from '../brand/Logo.jsx'
import AppearanceControl from './AppearanceControl.jsx'
import { useLayout } from './AppShell.jsx'
import NavBadge, { useFailedCount } from './NavBadge.jsx'
import { navItems } from './navItems.js'

// Selected rows: a soft frosted pill, like macOS sidebars
const SELECTED = 'bg-black/[0.06] font-semibold dark:bg-white/10'
const HOVER = 'hover:bg-black/[0.035] dark:hover:bg-white/5'

/*
  Mac and iPad landscape: a translucent sidebar, like Finder or Mail.
  Besides the three sections it lists every pipeline. Healthy ones stay quiet
  (just how long ago they ran); only a failure (red mark) or a run in progress
  (spinner) draws the eye, so problems are visible from anywhere in the app.
  It collapses with a spring (toolbar button or the [ key).
*/
export default function Sidebar({ open }) {
  const { toggleSidebar } = useLayout()
  const failed = useFailedCount()
  const pipelines = usePipelines()
  useNow()

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: open ? 264 : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 42 }}
      className="sticky top-0 z-[2] h-dvh shrink-0 overflow-hidden"
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
            <SidebarSimple className="size-[18px]" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="mt-3 flex flex-col gap-0.5 px-2.5">
          {navItems.map(({ to, label, icon: Icon, showFailedCount }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] transition-colors ${isActive ? SELECTED : HOVER}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Filled icon when selected, outline otherwise, like iOS and macOS */}
                  <Icon className="size-[19px] text-tint-text" weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                  {label}
                  {showFailedCount && <NavBadge count={failed} className="ml-auto" />}
                </>
              )}
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
                    `flex h-8 items-center gap-2 rounded-[10px] pr-2.5 pl-[38px] text-[13px] transition-colors ${
                      isActive ? `${SELECTED} text-ink` : `text-ink-muted hover:text-ink ${HOVER}`
                    }`
                  }
                >
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <PipelineIndicator pipeline={p} />
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

// Quiet unless something needs attention.
function PipelineIndicator({ pipeline }) {
  if (pipeline.status === 'failed') {
    return (
      <>
        <WarningCircle className="size-4 shrink-0 text-fail-dot" weight="fill" aria-hidden="true" />
        <span className="sr-only">, failed</span>
      </>
    )
  }
  if (pipeline.status === 'running') {
    return (
      <>
        <CircleNotch className="size-3.5 shrink-0 text-run-dot motion-safe:animate-spin" weight="bold" aria-hidden="true" />
        <span className="sr-only">, running</span>
      </>
    )
  }
  return (
    <span className="shrink-0 text-xs text-ink-faint tabular-nums" title={`Last run ${pipeline.status}`}>
      {formatShortAgo(pipeline.lastRun.finishedAt ?? pipeline.lastRun.startedAt)}
      <span className="sr-only"> ago, {pipeline.status}</span>
    </span>
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
