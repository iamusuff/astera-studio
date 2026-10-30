import { useRef } from 'react'

/*
  A small set of mutually exclusive choices (date range, chart type).
  Built as a radio group: arrow keys move the selection, like native controls.
*/
export default function SegmentedControl({ label, options, value, onChange, className = '' }) {
  const refs = useRef([])

  function onKeyDown(event, index) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-lg bg-sunken p-1 ${className}`}>
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => (refs.current[index] = el)}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`h-10 rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-150 pointer-fine:h-7 ${
              selected
                ? 'bg-surface font-medium text-ink shadow-[0_1px_2px_rgb(22_32_42/0.12)]'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
