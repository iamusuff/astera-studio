import { LayoutGroup, motion } from 'motion/react'
import { CircleNotch, SidebarSimple, WarningCircle } from '@phosphor-icons/react'
import { NavLink, useLocation } from 'react-router'

import { useNow } from '../../hooks/useNow.js'
import { formatShortAgo } from '../../lib/format.js'
import { CURRENT_USER } from '../../data/pipelines.js'
import { subjectIcon } from '../../features/pipelines/subjectIcon.js'
import { usePipelines } from '../../state/AppStore.jsx'
import Logo from '../brand/Logo.jsx'
import { useLayout } from './AppShell.jsx'
import NavBadge, { useFailedCount } from './NavBadge.jsx'
import { SettingsButton } from './Settings.jsx'
import { navItems } from './navItems.js'

// Rows: hover is a faint fill; the selected row's pill (Selection) slides between rows
const HOVER = 'hover:bg-black/[0.035] dark:hover:bg-white/5'
const ROW_SPRING = { type: 'spring', stiffness: 520, damping: 42, mass: 0.8 }

/*
  Mac and iPad landscape: a translucent sidebar, like Finder or Mail.
  Besides the three sections it lists every pipeline, each with a small grey
  icon of what it's about (the same one as on the Pipelines page). Healthy
  ones stay quiet (just how long ago they ran); only a failure (red mark) or a
  run in progress (spinner) draws the eye, so problems are visible from
  anywhere in the app.
  It collapses with a spring (toolbar button or the [ key); its content fades
  and drifts left as it folds, so it never looks clipped. The gear next to
  your name opens Settings (appearance, reset demo data).
*/
export default function Sidebar({ open }) {
  const { toggleSidebar } = useLayout()
  const failed = useFailedCount()
  const pipelines = usePipelines()
  // Inside a pipeline, its own row below holds the selection, not "Pipelines"
  const inPipeline = /^\/pipelines\/./.test(useLocation().pathname)
  useNow()

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: open ? 264 : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 42 }}
      className="sticky top-0 z-[2] h-dvh shrink-0 overflow-hidden"
      inert={open ? undefined : ''}
    >
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0, x: open ? 0 : -24 }}
        transition={{ type: 'spring', stiffness: 420, damping: 42 }}
        className="glass-bar flex h-full w-[264px] flex-col border-r border-line"
      >
        <LayoutGroup id="sidebar">
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
                  `relative flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] transition-colors ${isActive ? 'font-semibold' : HOVER}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !(to === '/pipelines' && inPipeline) && <Selection />}
                    {/* Filled icon when selected, outline otherwise, like iOS and macOS */}
                    <Icon className="relative size-[19px] text-tint-text" weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                    <span className="relative">{label}</span>
                    {showFailedCount && <NavBadge count={failed} className="relative ml-auto" />}
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
                      `relative flex h-8 items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] transition-colors ${
                        isActive ? 'font-semibold text-ink' : `text-ink-muted hover:text-ink ${HOVER}`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <Selection />}
                        <PipelineIcon pipelineId={p.id} active={isActive} />
                        <span className="relative min-w-0 flex-1 truncate">{p.name}</span>
                        <span className="relative flex">
                          <PipelineIndicator pipeline={p} />
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        </LayoutGroup>

        <div className="relative mt-auto flex items-center gap-3 border-t border-line py-3 pr-2.5 pl-4">
          <Avatar />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold">{CURRENT_USER.name}</span>
            <span className="block truncate text-xs text-ink-muted">{CURRENT_USER.role}</span>
          </span>
          <SettingsButton />
        </div>
      </motion.div>
    </motion.aside>
  )
}

// The selected row's frosted pill. One shared layoutId, so it slides from row to row.
function Selection() {
  return (
    <motion.span
      layoutId="sidebar-selection"
      transition={ROW_SPRING}
      className="absolute inset-0 rounded-[10px] bg-black/[0.06] dark:bg-white/10"
      aria-hidden="true"
    />
  )
}

// What the pipeline is about, small and grey, in the same column as the icons
// above, so the names line up with Chat, Dashboard and Pipelines.
function PipelineIcon({ pipelineId, active }) {
  const Icon = subjectIcon(pipelineId)
  return (
    <span className="relative grid size-[19px] shrink-0 place-items-center" aria-hidden="true">
      <Icon className={`size-[15px] transition-colors ${active ? 'text-tint-text' : 'text-ink-muted'}`} weight={active ? 'fill' : 'regular'} />
    </span>
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
      {CURRENT_USER.initials}
    </span>
  )
}
