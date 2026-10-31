import { useState } from 'react'

import { CURRENT_USER } from '../../data/pipelines.js'
import Sheet from '../ui/Sheet.jsx'
import { SettingsPanel } from './Settings.jsx'
import { Avatar } from './Sidebar.jsx'

/*
  iPhone and iPad portrait have no sidebar, so the account lives where iOS apps
  put it: an avatar at the top right. It opens a sheet with your account and
  the same Settings as the sidebar's gear (appearance, reset demo data).
*/
export default function AccountButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Account and settings"
        className="grid size-11 place-items-center rounded-full transition-transform active:scale-95"
      >
        <Avatar className="size-8 text-xs" />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Settings">
        <div className="space-y-5 pb-2">
          <div className="flex items-center gap-3 rounded-[var(--radius-group)] inset-fill p-3">
            <Avatar className="size-12 text-sm" />
            <span className="leading-tight">
              <span className="block font-semibold">{CURRENT_USER.name}</span>
              <span className="block text-sm text-ink-muted">
                {CURRENT_USER.role}, {CURRENT_USER.company}
              </span>
            </span>
          </div>
          <SettingsPanel onClose={() => setOpen(false)} />
        </div>
      </Sheet>
    </>
  )
}
