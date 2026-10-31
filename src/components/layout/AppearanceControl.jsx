import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme } from '../../state/theme.jsx'
import SegmentedControl from '../ui/SegmentedControl.jsx'

const OPTIONS = [
  { value: 'system', label: 'Auto', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

// Light, dark, or follow the device (the default). Used in the sidebar and the account sheet.
export default function AppearanceControl({ compact = false }) {
  const { preference, setPreference } = useTheme()
  return (
    <SegmentedControl
      label="Appearance"
      value={preference}
      onChange={setPreference}
      className={`flex w-full [&>button]:flex-1 ${compact ? '' : ''}`}
      options={OPTIONS.map(({ value, label, icon: Icon }) => ({
        value,
        label: (
          <span className="inline-flex items-center gap-1.5">
            <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {label}
          </span>
        ),
      }))}
    />
  )
}
