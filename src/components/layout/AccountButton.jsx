import { Devices } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router'

import Sheet from '../ui/Sheet.jsx'
import AppearanceControl from './AppearanceControl.jsx'
import { Avatar } from './Sidebar.jsx'

/*
  iPhone and iPad portrait have no sidebar, so the account lives where iOS apps
  put it: an avatar at the top right. It opens a sheet with Appearance.
*/
export default function AccountButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Account and appearance"
        className="grid size-11 place-items-center rounded-full transition-transform active:scale-95"
      >
        <Avatar className="size-8 text-xs" />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Account">
        <div className="space-y-6 pb-2">
          <div className="flex items-center gap-3 rounded-[var(--radius-group)] bg-paper p-3">
            <Avatar className="size-12 text-sm" />
            <span className="leading-tight">
              <span className="block font-semibold">Muhammad Yousuf</span>
              <span className="block text-sm text-ink-muted">Halden Outfitters</span>
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Appearance</p>
            <AppearanceControl />
          </div>
          <Link
            to="/preview"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2 text-[15px] font-semibold text-tint-text"
          >
            <Devices className="size-[18px]" aria-hidden="true" />
            Device preview
          </Link>
        </div>
      </Sheet>
    </>
  )
}
