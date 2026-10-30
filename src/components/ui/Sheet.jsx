import { Drawer } from 'vaul'

/*
  Bottom sheet for phones, built on Vaul: drag down to dismiss, focus is kept
  inside while open, and Escape closes it. It pads above the iPhone home
  indicator and never grows taller than 92% of the visible screen.
*/
export default function Sheet({ open, onOpenChange, title, description, children, footer }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-surface outline-none">
          <Drawer.Handle className="mt-2.5 mb-1 !h-1.5 !w-10 !bg-line-strong" />
          <div className="px-4 pt-2 pb-3">
            <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
            {description && (
              <Drawer.Description className="mt-0.5 text-sm text-ink-muted">{description}</Drawer.Description>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
          {footer && (
            <div className="border-t border-line px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
              {footer}
            </div>
          )}
          {!footer && <div className="h-[env(safe-area-inset-bottom,0px)] shrink-0" />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
