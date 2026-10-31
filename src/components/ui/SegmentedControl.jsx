import { LayoutGroup, motion } from 'motion/react'
import { useId, useRef } from 'react'

export const SPRING = { type: 'spring', stiffness: 500, damping: 34, mass: 0.8 }

/*
  iOS segmented control. The white thumb slides to the chosen segment on a
  spring (motion's shared layout animation), like the native control, and
  the label you press dips slightly, so the control answers your finger.
  Built as a radio group: arrow keys move the selection.
*/
export default function SegmentedControl({ label, options, value, onChange, className = '' }) {
  const refs = useRef([])
  const groupId = useId()

  function onKeyDown(event, index) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <LayoutGroup id={groupId}>
      <div role="radiogroup" aria-label={label} className={`inline-flex rounded-[11px] bg-sunken p-[3px] ${className}`}>
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
              className={`relative h-10 rounded-[9px] px-3.5 text-sm whitespace-nowrap transition-colors duration-200 pointer-fine:h-7 pointer-fine:text-[13px] ${
                selected ? 'font-semibold text-ink' : 'font-medium text-ink-muted hover:text-ink'
              }`}
            >
              {selected && <Thumb />}
              <span className="relative inline-block transition-transform duration-150 ease-out-ui [button:active>&]:scale-[0.94]">
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export function Thumb({ className = 'rounded-[9px]' }) {
  return (
    <motion.span
      layoutId="thumb"
      transition={SPRING}
      className={`absolute inset-0 bg-raised shadow-[0_3px_8px_rgb(0_0_0/0.12),0_1px_1px_rgb(0_0_0/0.04)] ${className}`}
      aria-hidden="true"
    />
  )
}
