import { Check, SlidersHorizontal } from '@phosphor-icons/react'
import { useState } from 'react'

import Button from '../../components/ui/Button.jsx'
import SegmentedControl from '../../components/ui/SegmentedControl.jsx'
import Select from '../../components/ui/Select.jsx'
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
      <Button variant="gray" onClick={() => setOpen(true)} className="w-full justify-start font-medium">
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        <span className="truncate">{filterLabel(filters).replace(/^./, (c) => c.toUpperCase())}</span>
        <span className="ml-auto text-sm font-semibold text-tint-text">Change</span>
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
      {stacked ? (
        <RegionList value={filters.region} onChange={(v) => setFilter('region', v)} />
      ) : (
        <div>
          <label htmlFor="region-filter" className="sr-only">
            Region
          </label>
          <Select
            id="region-filter"
            value={filters.region}
            options={REGION_OPTIONS}
            onChange={(v) => setFilter('region', v)}
            className="min-w-40"
          />
        </div>
      )}
    </div>
  )
}

// In the phone's filter sheet: an iOS inset list with a check, one tap to choose.
function RegionList({ value, onChange }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Region</legend>
      <div className="overflow-hidden rounded-[var(--radius-group)] inset-fill">
        {REGION_OPTIONS.map((o, index) => {
          const selected = o.value === value
          return (
            <label
              key={o.value}
              className={`flex min-h-11 cursor-pointer items-center gap-3 px-4 text-[15px] transition-colors active:bg-black/[0.05] has-[:focus-visible]:bg-tint-soft dark:active:bg-white/[0.06] ${
                index > 0 ? 'border-t border-line' : ''
              }`}
            >
              <input
                type="radio"
                name="region"
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className={`flex-1 ${selected ? 'font-semibold' : ''}`}>{o.label}</span>
              {selected && <Check className="size-[18px] text-tint-text" weight="bold" aria-hidden="true" />}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
