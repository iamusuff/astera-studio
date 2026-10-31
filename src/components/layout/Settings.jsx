import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ArrowCounterClockwise, CaretRight, Devices, GearSix } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { crossFade } from '../../lib/viewTransition.js'
import { useActions } from '../../state/AppStore.jsx'
import { useTheme } from '../../state/theme.jsx'
import Button from '../ui/Button.jsx'
import { notify } from '../ui/notify.jsx'

const SPRING = { type: 'spring', stiffness: 460, damping: 34 }

/*
  Settings: appearance, reset the demo, device preview.
  Mac / iPad landscape: the gear next to your name opens it as a popover.
  iPhone / iPad portrait: it is inside the account sheet (AccountButton).
*/
export function SettingsPanel({ onClose }) {
  return (
    <div className="space-y-4">
      <AppearancePicker />
      <div className="space-y-1 border-t border-line pt-3">
        <ResetRow onDone={onClose} />
        <Link
          to="/preview"
          onClick={onClose}
          className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-[15px] font-medium transition-colors hover:bg-black/[0.04] active:bg-black/[0.06] pointer-fine:min-h-9 pointer-fine:text-sm dark:hover:bg-white/[0.06]"
        >
          <Devices className="size-[18px] text-ink-muted" aria-hidden="true" />
          Device preview
          <CaretRight className="ml-auto size-3.5 text-ink-faint" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

/* ---------- Appearance: three preview tiles, like iOS Display & Brightness ---------- */

const APPEARANCES = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function AppearancePicker() {
  const { preference, changePreference } = useTheme()
  const refs = useRef([])
  const group = useId()

  function choose(value, index) {
    if (value !== preference) changePreference(value, refs.current[index])
  }

  function onKeyDown(event, index) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + APPEARANCES.length) % APPEARANCES.length
    refs.current[next]?.focus()
    choose(APPEARANCES[next].value, next)
  }

  return (
    <div>
      <p id={`${group}-label`} className="px-1 text-xs font-semibold text-ink-muted">
        Appearance
      </p>
      <LayoutGroup id={group}>
        <div role="radiogroup" aria-labelledby={`${group}-label`} className="mt-2 grid grid-cols-3 gap-2">
          {APPEARANCES.map(({ value, label }, index) => {
            const selected = value === preference
            return (
              <button
                key={value}
                ref={(el) => (refs.current[index] = el)}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(value, index)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className="group flex flex-col items-center gap-1.5 rounded-xl pt-1 pb-0.5 focus-visible:outline-offset-0"
              >
                <span className="relative block w-full p-[3px]">
                  {selected && (
                    <motion.span
                      layoutId="appearance-ring"
                      transition={SPRING}
                      className="absolute inset-0 rounded-[13px] ring-2 ring-tint"
                      aria-hidden="true"
                    />
                  )}
                  <motion.span className="block" whileTap={{ scale: 0.94 }} transition={SPRING}>
                    <ThemePreview kind={value} />
                  </motion.span>
                </span>
                <span className={`text-xs transition-colors ${selected ? 'font-semibold text-ink' : 'font-medium text-ink-muted'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}

// A tiny drawing of the app in each look: a window with a title bar and two cards.
function ThemePreview({ kind }) {
  const light = (
    <span className="absolute inset-0 bg-[#f2f2f7]">
      <Mock bar="#ffffff" card="#ffffff" line="#d1d1d6" />
    </span>
  )
  const dark = (
    <span className="absolute inset-0 bg-[#000000]">
      <Mock bar="#1c1c1e" card="#1c1c1e" line="#3a3a3c" />
    </span>
  )
  return (
    <span
      className="relative block aspect-[4/3] w-full overflow-hidden rounded-[10px] shadow-[0_0_0_0.5px_rgb(0_0_0/0.14),0_2px_6px_rgb(0_0_0/0.08)]"
      aria-hidden="true"
    >
      {kind === 'dark' ? dark : light}
      {kind === 'system' && <span className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">{dark}</span>}
    </span>
  )
}

function Mock({ bar, card, line }) {
  return (
    <>
      <span className="absolute inset-x-0 top-0 h-[22%]" style={{ background: bar, borderBottom: `0.5px solid ${line}` }} />
      <span className="absolute top-[9%] left-[8%] size-[6%] rounded-full bg-[#0a84ff]" />
      <span className="absolute top-[34%] right-[8%] left-[8%] h-[24%] rounded-[3px]" style={{ background: card, boxShadow: `0 0 0 0.5px ${line}` }} />
      <span className="absolute top-[66%] right-[46%] left-[8%] h-[22%] rounded-[3px]" style={{ background: card, boxShadow: `0 0 0 0.5px ${line}` }} />
      <span className="absolute top-[66%] right-[8%] left-[58%] h-[22%] rounded-[3px] bg-[#0a84ff]/80" />
    </>
  )
}

/* ---------- Reset demo data: asks once, inline, then cross-fades to a fresh start ---------- */

function ResetRow({ onDone }) {
  const { reset } = useActions()
  const [confirming, setConfirming] = useState(false)
  const id = useId()

  function confirm() {
    toast.dismiss() // old banners' Undo / Re-run buttons would act on the fresh data
    crossFade(() => {
      onDone?.()
      reset()
    })
    notify({ title: 'Demo data reset', description: 'Chat, pins, edits and fixes are back to the start.', success: true })
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming((c) => !c)}
        aria-expanded={confirming}
        aria-controls={id}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] font-medium transition-colors hover:bg-black/[0.04] active:bg-black/[0.06] pointer-fine:min-h-9 pointer-fine:text-sm dark:hover:bg-white/[0.06]"
      >
        <motion.span animate={{ rotate: confirming ? -180 : 0 }} transition={SPRING} className="grid place-items-center">
          <ArrowCounterClockwise className="size-[18px] text-ink-muted" aria-hidden="true" />
        </motion.span>
        Reset demo data
      </button>
      <AnimatePresence initial={false}>
        {confirming && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="overflow-hidden"
          >
            <div className="px-2 pt-1 pb-2">
              <p className="text-[13px] text-ink-muted">
                Clears the chat, pins, pipeline edits and fixes, and stops runs. Your appearance setting stays.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="gray" size="sm" className="flex-1" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={confirm}>
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- The gear in the sidebar, and its popover ---------- */

export function SettingsButton() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    // Start keyboard users on the current appearance
    panelRef.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true })

    const inside = (node) => panelRef.current?.contains(node) || buttonRef.current?.contains(node)
    const onPointerDown = (e) => !inside(e.target) && setOpen(false)
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const onFocusOut = (e) => e.relatedTarget && !inside(e.relatedTarget) && setOpen(false)

    const panel = panelRef.current
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    panel?.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      panel?.removeEventListener('focusout', onFocusOut)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Settings"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title="Settings"
        className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
          open ? 'bg-black/[0.06] text-ink dark:bg-white/10' : 'text-ink-muted hover:bg-black/[0.05] hover:text-ink dark:hover:bg-white/[0.08]'
        }`}
      >
        <motion.span animate={{ rotate: open ? 60 : 0 }} transition={SPRING} className="grid place-items-center">
          <GearSix className="size-[20px]" weight={open ? 'fill' : 'regular'} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Settings"
            initial={{ opacity: 0, scale: 0.9, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 8, filter: 'blur(4px)', transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{ transformOrigin: 'calc(100% - 22px) calc(100% + 30px)' }}
            className="glass-float absolute right-2.5 bottom-[calc(100%+6px)] left-2.5 z-40 rounded-[22px] p-3"
          >
            <SettingsPanel onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
