// The mark is a single pipe: a source node, a bend, and a destination node.
// It is the same shape as the connectors in the pipeline view.
export function LogoMark({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-ink" />
      <path
        d="M9 11h6a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h2"
        fill="none"
        className="stroke-paper"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="9" cy="11" r="2.5" className="fill-paper" />
      <circle cx="23" cy="21" r="2.5" className="fill-paper" />
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.01em]">Astera Studio</span>
    </span>
  )
}
