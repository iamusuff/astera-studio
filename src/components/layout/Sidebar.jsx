import { NavLink } from 'react-router'

import Logo from '../brand/Logo.jsx'
import { navItems } from './navItems.js'
import NavBadge, { useFailedCount } from './NavBadge.jsx'

// Desktop only (>= 1280px): full labels, workspace and signed-in user.
export default function Sidebar() {
  const failed = useFailedCount()
  return (
    <aside aria-label="Sidebar" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line xl:flex">
      <div className="px-5 pt-6 pb-8">
        <Logo />
      </div>

      <nav aria-label="Main" className="flex flex-col gap-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon, showFailedCount }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-lg px-3 transition-colors ${
                isActive
                  ? 'bg-sunken font-medium text-ink'
                  : 'text-ink-muted hover:bg-sunken/60 hover:text-ink'
              }`
            }
          >
            <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            {label}
            {showFailedCount && <NavBadge count={failed} className="ml-auto" />}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 border-t border-line px-5 py-4">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full bg-sunken text-[13px] font-semibold"
          aria-hidden="true"
        >
          MY
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-medium">Muhammad Yousuf</span>
          <span className="block truncate text-[13px] text-ink-muted">Halden Outfitters</span>
        </span>
      </div>
    </aside>
  )
}
