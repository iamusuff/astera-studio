import { Drawer } from 'vaul'

/*
  iOS-style bottom sheet (Vaul): drag down to dismiss with momentum, focus
  stays inside while open, Escape closes it. Like iOS, the page behind
  shrinks back slightly while the sheet is up (shouldScaleBackground works
  with the data-vaul-drawer-wrapper on the app shell). It pads above the
  home indicator and never grows taller than 92% of the visible screen.
*/
export default function Sheet({ open, onOpenChange, title, description, children, footer }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-surface/90 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_-8px_40px_rgb(0_0_0/0.12)] outline-none">
          <Drawer.Handle className="mt-2 mb-1 !h-[5px] !w-9 !bg-line-strong" />
          <div className="px-5 pt-2 pb-3">
            <Drawer.Title className="text-[20px] font-bold tracking-[-0.02em]">{title}</Drawer.Title>
            {description && (
              <Drawer.Description className="mt-0.5 text-sm text-ink-muted">{description}</Drawer.Description>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
          {footer && (
            <div className="border-t border-line px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">{footer}</div>
          )}
          {!footer && <div className="h-[env(safe-area-inset-bottom,0px)] shrink-0" />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
