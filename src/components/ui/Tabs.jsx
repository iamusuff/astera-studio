import { LayoutGroup } from 'motion/react'
import { useId, useRef } from 'react'

import { Thumb } from './SegmentedControl.jsx'

/*
  Tabs that look like an iOS segmented control (full width, sliding thumb)
  but behave as a proper tablist for assistive tech: arrow keys move between
  tabs, and the parent renders the panel with id={`${idBase}-panel`}.
*/
export default function Tabs({ tabs, value, onChange, label, idBase, className = '' }) {
  const refs = useRef([])
  const groupId = useId()

  function onKeyDown(event, index) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + tabs.length) % tabs.length
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <LayoutGroup id={groupId}>
      <div role="tablist" aria-label={label} className={`flex rounded-[11px] bg-sunken p-[3px] ${className}`}>
        {tabs.map((tab, index) => {
          const selected = tab.id === value
          return (
            <button
              key={tab.id}
              ref={(el) => (refs.current[index] = el)}
              type="button"
              role="tab"
              id={`${idBase}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${idBase}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`relative h-10 flex-1 rounded-[9px] text-sm transition-colors duration-200 pointer-fine:h-8 ${
                selected ? 'font-semibold text-ink' : 'font-medium text-ink-muted hover:text-ink'
              }`}
            >
              {selected && <Thumb />}
              <span className="relative">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
