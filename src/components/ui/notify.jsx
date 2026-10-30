import { X } from 'lucide-react'
import { toast } from 'sonner'

/*
  The app's toast. Sonner handles position, stacking and swipe-to-dismiss;
  the look is our own (headless toast.custom) so it matches the rest of the UI.

  notify({ title, description, action: { label, onClick }, secondary: { label, onClick } })

  Wording rule: the toast reuses the button's verb. "Pin" -> "Pinned to dashboard".
*/
export function notify({ title, description, action, secondary, duration = 6000 }) {
  return toast.custom(
    (id) => (
      <div
        role="status"
        className="flex w-full items-start gap-3 rounded-xl bg-ink py-3 pr-2 pl-4 text-white shadow-[0_8px_24px_rgb(22_32_42/0.28)] md:w-[360px]"
      >
        <div className="min-w-0 flex-1 py-1">
          <p className="text-sm font-medium">{title}</p>
          {description && <p className="mt-0.5 text-[13px] text-white/70">{description}</p>}
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
              className="h-11 rounded-lg px-3 text-sm font-medium text-white hover:bg-white/10 pointer-fine:h-8"
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => toast.dismiss(id)}
            className="grid size-11 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white pointer-fine:size-8"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    ),
    { duration },
  )
}
