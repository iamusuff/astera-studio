import { CircleAlert, CircleCheck, CircleDashed, Clock, LoaderCircle } from 'lucide-react'

/*
  Status is always icon + word, never color alone, so it still reads for
  color-blind users and in grayscale. Pipelines use the first four; "waiting"
  is for a step that has not run in the latest run.
*/
export const STATUS = {
  succeeded: { label: 'Succeeded', icon: CircleCheck, text: 'text-ok', fill: 'bg-ok-soft' },
  running: { label: 'Running', icon: LoaderCircle, text: 'text-run', fill: 'bg-run-soft', spin: true },
  failed: { label: 'Failed', icon: CircleAlert, text: 'text-fail', fill: 'bg-fail-soft' },
  scheduled: { label: 'Scheduled', icon: Clock, text: 'text-ink-muted', fill: 'bg-sunken' },
  waiting: { label: 'Not run', icon: CircleDashed, text: 'text-ink-muted', fill: 'bg-sunken' },
}

export function StatusIcon({ status, className = 'size-4' }) {
  const { icon: Icon, text, spin } = STATUS[status]
  return (
    <Icon
      className={`${className} ${text} shrink-0 ${spin ? 'animate-spin [animation-duration:1.6s]' : ''}`}
      strokeWidth={2}
      aria-hidden="true"
    />
  )
}

/** variant "pill": tinted background, for lists and headers. "plain": icon + text only, for dense rows. */
export default function StatusBadge({ status, label, variant = 'pill', className = '' }) {
  const { label: defaultLabel, text, fill } = STATUS[status]
  const pill = variant === 'pill'
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] leading-none font-medium whitespace-nowrap ${text} ${
        pill ? `${fill} h-6 rounded-full pr-2.5 pl-2` : ''
      } ${className}`}
    >
      <StatusIcon status={status} className="size-3.5" />
      {label ?? defaultLabel}
    </span>
  )
}
