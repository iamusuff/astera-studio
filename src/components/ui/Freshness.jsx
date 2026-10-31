import { Warning } from '@phosphor-icons/react'

import { useNow } from '../../hooks/useNow.js'
import { formatExact, formatRelative } from '../../lib/format.js'

/*
  "Updated 3h ago". The exact time is in the <time> element for screen readers
  and as a title for mouse users; it is never the only way to get information.
  When stale, the label turns amber and says so in words.
*/
export default function Freshness({ at, stale = false, prefix = 'Updated', className = '' }) {
  useNow()
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] ${stale ? 'text-warn' : 'text-ink-muted'} ${className}`}>
      {stale && <Warning className="size-3.5 shrink-0" aria-hidden="true" />}
      <span>
        {stale ? 'Last good data ' : `${prefix} `}
        <time dateTime={at} title={formatExact(at)}>
          {formatRelative(at)}
        </time>
      </span>
    </span>
  )
}
