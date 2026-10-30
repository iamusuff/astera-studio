// Shared top of every screen: title, one line of context, and optional actions.
// On phones it pads below the notch/status bar (safe-area-inset-top).
export default function PageHeader({ title, description, actions }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-5 md:px-8 md:pt-8 xl:px-10">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] md:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-[60ch] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
