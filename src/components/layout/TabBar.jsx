import { LayoutGroup, motion } from 'motion/react'
import { NavLink } from 'react-router'

import NavBadge, { useFailedCount } from './NavBadge.jsx'
import { navItems } from './navItems.js'

/*
  iPhone and iPad portrait: a floating glass tab bar, within thumb reach,
  lifted above the home indicator. The highlight slides between tabs on a
  spring. Content scrolls underneath and shows through the glass.
*/
export default function TabBar() {
  const failed = useFailedCount()
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+10px)] z-30 flex justify-center px-4"
    >
      <LayoutGroup id="tabbar">
        <div className="glass-float flex h-[62px] w-full max-w-[400px] items-center gap-1 rounded-full p-1.5">
          {navItems.map(({ to, label, icon: Icon, showFailedCount }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-tint-text' : 'text-ink-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-highlight"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      className="absolute inset-0 rounded-full bg-sunken/90 dark:bg-white/[0.06]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">
                    <Icon className="size-[24px]" weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                    {showFailedCount && <NavBadge count={failed} className="absolute -top-1.5 -right-3" />}
                  </span>
                  <span className="relative">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </LayoutGroup>
    </nav>
  )
}
