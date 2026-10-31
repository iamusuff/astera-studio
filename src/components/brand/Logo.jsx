import { useId } from 'react'

// The mark is a single pipe (a source node, a bend, a destination node) on an
// app-icon squircle. It is the same shape as the connectors in the pipeline view.
export function LogoMark({ className = 'size-8' }) {
  const id = useId()
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c9bff" />
          <stop offset="1" stopColor="#005fd6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <path d="M9 11h6a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h2" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="9" cy="11" r="2.5" fill="#fff" />
      <circle cx="23" cy="21" r="2.5" fill="#fff" />
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="size-7" />
      <span className="text-[15px] font-semibold tracking-[-0.01em]">Astera Studio</span>
    </span>
  )
}
