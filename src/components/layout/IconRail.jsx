import { NavLink } from 'react-router'

import { LogoMark } from '../brand/Logo.jsx'
import { navItems } from './navItems.js'

// iPad (768-1279px): a slim rail. Labels stay under the icons because
// icon-only navigation makes people guess, and there is no hover to explain it.
export default function IconRail() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col items-center border-r border-line pt-[max(1.25rem,env(safe-area-inset-top,0px))] md:flex xl:hidden">
      <LogoMark />

      <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex h-16 w-[68px] flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors ${
                isActive ? 'bg-sunken font-medium text-ink' : 'text-ink-muted hover:text-ink'
              }`
            }
          >
            <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <span
        className="mt-auto mb-5 grid size-9 place-items-center rounded-full bg-sunken text-[13px] font-semibold"
        title="Muhammad Yousuf"
        aria-label="Signed in as Muhammad Yousuf"
      >
        MY
      </span>
    </aside>
  )
}
