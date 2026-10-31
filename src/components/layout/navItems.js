import { ChatCircle, FlowArrow, SquaresFour } from '@phosphor-icons/react'

// One list drives all three navigation patterns (sidebar, icon rail, tab bar),
// so the destinations and their order can never drift apart between devices.
export const navItems = [
  { to: '/chat', label: 'Chat', icon: ChatCircle },
  { to: '/dashboard', label: 'Dashboard', icon: SquaresFour },
  { to: '/pipelines', label: 'Pipelines', icon: FlowArrow, showFailedCount: true },
]
