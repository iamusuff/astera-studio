import { usePipelines } from '../../state/AppStore.jsx'

// Number of failed pipelines, shown on the Pipelines nav item on every device.
// Red here means "something needs you", which is the only thing red ever means.
export function useFailedCount() {
  return usePipelines().filter((p) => p.status === 'failed').length
}

export default function NavBadge({ count, className = '' }) {
  if (!count) return null
  return (
    <span
      className={`grid h-[18px] min-w-[18px] place-items-center rounded-full bg-fail px-1 text-[11px] leading-none font-semibold text-white ${className}`}
    >
      {count}
      <span className="sr-only"> failed</span>
    </span>
  )
}
