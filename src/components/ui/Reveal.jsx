import { motion } from 'motion/react'

/*
  Content that settles into place when a screen opens: a short rise and fade
  on a spring, staggered by `order` (50ms apart), so a screen assembles
  instead of snapping in. Skipped under reduce motion (MotionConfig in AppShell).
*/
export default function Reveal({ order = 0, className, children, as = 'div' }) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.04 + order * 0.05 }}
    >
      {children}
    </Component>
  )
}
