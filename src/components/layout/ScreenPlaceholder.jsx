// Temporary: marks where each screen will be built. Removed once all screens exist.
export default function ScreenPlaceholder({ phase }) {
  return (
    <div className="px-4 md:px-8 xl:px-10">
      <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line-strong text-ink-muted">
        Built in phase {phase}
      </div>
    </div>
  )
}
