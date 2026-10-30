import { LayoutDashboard, MessageSquare, Workflow } from 'lucide-react'

// One list drives all three navigation patterns (sidebar, icon rail, tab bar),
// so the destinations and their order can never drift apart between devices.
export const navItems = [
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pipelines', label: 'Pipelines', icon: Workflow },
]
