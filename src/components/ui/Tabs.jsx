import { useRef } from 'react'

/*
  Accessible tabs: a tablist with arrow-key navigation. The parent renders the
  panel for the selected tab with id={`${idBase}-panel`}.
*/
export default function Tabs({ tabs, value, onChange, label, idBase, className = '' }) {
  const refs = useRef([])

  function onKeyDown(event, index) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + tabs.length) % tabs.length
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className={`flex gap-1 border-b border-line ${className}`}>
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
            className={`-mb-px min-h-11 border-b-2 px-3 text-sm transition-colors pointer-fine:min-h-9 ${
              selected ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
