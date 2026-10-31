import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { CaretUpDown, Check } from '@phosphor-icons/react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SPRING = { type: 'spring', stiffness: 520, damping: 36, mass: 0.8 }
const ROW = 'h-11 text-[15px] pointer-fine:h-8 pointer-fine:text-sm'

/*
  Pop-up button, like iOS and macOS: tap it and a glass menu springs out of
  it, with a check next to the current choice. A highlight follows the pointer
  or the arrow keys. Used instead of a native <select> so it matches the app
  and animates; it keeps the same keyboard behavior:
    button   Enter, Space, Arrow up/down open the menu
    menu     arrows / Home / End move, Enter or Space choose, Escape or Tab close

  The menu renders at the top of <main> (body as a fallback) with fixed
  position, so a card or scroll area can never clip it, and screen readers
  still find it inside the page's main landmark. It opens below the button, or above when there is
  no room, and closes when the page scrolls or resizes.

  Props: id (for a <label htmlFor>), value, options [{ value, label }], onChange, className
*/
export default function Select({ id, value, options, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [place, setPlace] = useState(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value))
  const current = options[selectedIndex]

  function openMenu() {
    const rect = buttonRef.current.getBoundingClientRect()
    const rowHeight = window.matchMedia('(pointer: fine)').matches ? 32 : 44
    const height = options.length * rowHeight + 12
    const below = window.innerHeight - rect.bottom
    const up = below < height + 16 && rect.top > below
    setPlace({
      left: Math.min(rect.left, window.innerWidth - Math.max(rect.width, 200) - 8),
      width: rect.width,
      up,
      ...(up ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    })
    setActive(selectedIndex)
    setOpen(true)
  }

  function close({ focusButton = true } = {}) {
    setOpen(false)
    if (focusButton) buttonRef.current?.focus({ preventScroll: true })
  }

  function choose(index) {
    const option = options[index]
    if (option && option.value !== value) onChange(option.value)
    close()
  }

  // Focus the menu when it opens, so the keyboard works straight away
  useLayoutEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (!listRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close({ focusButton: false })
    }
    const onMove = (e) => e.target !== listRef.current && close({ focusButton: false })
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open])

  function onButtonKeyDown(event) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openMenu()
    }
  }

  function onListKeyDown(event) {
    const last = options.length - 1
    const moves = {
      ArrowDown: Math.min(active + 1, last),
      ArrowUp: Math.max(active - 1, 0),
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      setActive(moves[event.key])
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(active)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      close({ focusButton: false })
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onButtonKeyDown}
        className={`flex items-center gap-2 rounded-xl bg-sunken pr-2.5 pl-3.5 font-medium text-ink transition-[background-color,transform] duration-200 ease-out-ui hover:bg-line active:scale-[0.98] pointer-fine:rounded-[10px] ${ROW} ${className}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">{current?.label}</span>
        <CaretUpDown className="size-4 shrink-0 text-ink-muted" weight="bold" aria-hidden="true" />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && place && (
            <motion.ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={id}
              aria-activedescendant={`${listId}-${active}`}
              onKeyDown={onListKeyDown}
              initial={{ opacity: 0, scale: 0.9, y: place.up ? 8 : -8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(2px)', transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
              transition={SPRING}
              style={{
                left: place.left,
                top: place.top,
                bottom: place.bottom,
                minWidth: Math.max(place.width, 200),
                transformOrigin: place.up ? '24px 100%' : '24px 0',
              }}
              className="glass-float fixed z-[60] max-h-[60dvh] overflow-y-auto rounded-[16px] p-1.5 outline-none"
            >
              <LayoutGroup id={listId}>
                {options.map((option, index) => {
                  const selected = index === selectedIndex
                  return (
                    <li
                      key={option.value}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => setActive(index)}
                      onClick={() => choose(index)}
                      className={`relative flex cursor-pointer items-center gap-2 rounded-[10px] pr-4 pl-2 select-none ${ROW} ${
                        selected ? 'font-semibold' : ''
                      }`}
                    >
                      {index === active && (
                        <motion.span
                          layoutId="highlight"
                          transition={SPRING}
                          className="absolute inset-0 rounded-[10px] bg-black/[0.06] dark:bg-white/10"
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative grid w-4 shrink-0 place-items-center">
                        {selected && <Check className="size-4 text-tint-text" weight="bold" aria-hidden="true" />}
                      </span>
                      <span className="relative whitespace-nowrap">{option.label}</span>
                    </li>
                  )
                })}
              </LayoutGroup>
            </motion.ul>
          )}
        </AnimatePresence>,
        document.getElementById('main') ?? document.body,
      )}
    </>
  )
}
