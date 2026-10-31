import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import Button from '../../components/ui/Button.jsx'
import SegmentedControl from '../../components/ui/SegmentedControl.jsx'
import Sheet from '../../components/ui/Sheet.jsx'
import { filterLabel, REGION_OPTIONS } from '../../data/dashboard.js'
import { PERIODS } from '../../data/sales.js'
import { useIsPhone } from '../../hooks/useMediaQuery.js'
import { useActions, useStore } from '../../state/AppStore.jsx'

const PERIOD_OPTIONS = PERIODS.map((p) => ({ value: p.id, label: p.id === 'ytd' ? 'Year to date' : p.label.replace(' 2026', '') }))

/*
  Date range and region filters. Changes apply immediately (no "Apply" button).
    iPad and desktop   both controls inline
    phone              one button that names the current filters and opens a sheet,
                       because two controls side by side don't fit 375px
*/
export default function FilterBar() {
  const isPhone = useIsPhone()
  const { filters } = useStore().state
  const [open, setOpen] = useState(false)

  if (!isPhone) return <FilterControls filters={filters} />

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className="w-full justify-start">
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        <span className="truncate">{filterLabel(filters).replace(/^./, (c) => c.toUpperCase())}</span>
        <span className="ml-auto text-sm font-normal text-ink-muted">Change</span>
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Filters"
        description="Charts update as you choose."
        footer={
          <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        <FilterControls filters={filters} stacked />
      </Sheet>
    </>
  )
}

function FilterControls({ filters, stacked = false }) {
  const { setFilter } = useActions()
  return (
    <div className={stacked ? 'space-y-5 pb-2' : 'flex flex-wrap items-center gap-3'}>
      <div className={stacked ? 'space-y-2' : ''}>
        {stacked && <p className="text-sm font-medium">Date range</p>}
        <SegmentedControl
          label="Date range"
          options={PERIOD_OPTIONS}
          value={filters.period}
          onChange={(v) => setFilter('period', v)}
          className={stacked ? 'flex w-full [&>button]:flex-1' : ''}
        />
      </div>
      <div className={stacked ? 'space-y-2' : ''}>
        <label htmlFor="region-filter" className={stacked ? 'block text-sm font-medium' : 'sr-only'}>
          Region
        </label>
        {/* Native select: on iPhone and iPad it opens the system picker, which is the most
            comfortable way to choose from a list by touch. */}
        <div className="relative">
          <select
            id="region-filter"
            value={filters.region}
            onChange={(e) => setFilter('region', e.target.value)}
            className={`h-11 appearance-none rounded-lg border border-line-strong bg-surface pr-10 pl-3.5 text-[15px] pointer-fine:h-9 pointer-fine:text-sm ${stacked ? 'w-full' : 'min-w-40'}`}
          >
            {REGION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
