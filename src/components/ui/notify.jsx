import { CircleCheck, X } from 'lucide-react'
import { toast } from 'sonner'

/*
  The app's toast, styled as an iOS banner: frosted glass, rounded, with an
  optional success icon. Sonner handles position, stacking and swipe-to-dismiss.

  notify({ title, description, success, action: { label, onClick }, secondary: { label, onClick } })

  Wording rule: the toast reuses the button's verb. "Pin" -> "Pinned to dashboard".
*/
export function notify({ title, description, action, secondary, success = false, duration = 6000 }) {
  return toast.custom(
    (id) => (
      <div role="status" className="glass-float flex w-full items-center gap-3 rounded-[22px] py-2.5 pr-2 pl-4 text-ink md:w-[390px]">
        {success && <CircleCheck className="size-5 shrink-0 text-ok-dot" strokeWidth={2.25} aria-hidden="true" />}
        <div className="min-w-0 flex-1 py-1">
          <p className="text-[15px] font-semibold">{title}</p>
          {description && <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center">
          {[secondary, action].filter(Boolean).map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.onClick()
                toast.dismiss(id)
              }}
              className="h-11 rounded-full px-3 text-[15px] font-semibold text-tint-text transition-colors hover:bg-tint-soft pointer-fine:h-8 pointer-fine:text-sm"
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => toast.dismiss(id)}
            className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-sunken pointer-fine:size-8"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    ),
    { duration },
  )
}
