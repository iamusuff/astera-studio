import { NavLink } from 'react-router'

import { navItems } from './navItems.js'

// Phone (< 768px): bottom tab bar, within thumb reach. It is a solid surface
// (no blur) and pads itself above the iPhone home indicator.
export default function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs ${
              isActive ? 'font-medium text-ink' : 'text-ink-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className="size-[22px]"
                strokeWidth={isActive ? 2 : 1.75}
                aria-hidden="true"
              />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
