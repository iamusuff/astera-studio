import { CheckCircle, CircleDashed, CircleNotch, Clock, WarningCircle } from '@phosphor-icons/react'

/*
  Status is always icon + word, never color alone, so it still reads for
  color-blind users and in grayscale. Pipelines use the first four; "waiting"
  is for a step that has not run in the latest run.
*/
export const STATUS = {
  succeeded: { label: 'Succeeded', icon: CheckCircle, text: 'text-ok', fill: 'bg-ok-soft', weight: 'fill' },
  running: { label: 'Running', icon: CircleNotch, text: 'text-run', fill: 'bg-run-soft', spin: true, weight: 'bold' },
  failed: { label: 'Failed', icon: WarningCircle, text: 'text-fail', fill: 'bg-fail-soft', weight: 'fill' },
  scheduled: { label: 'Scheduled', icon: Clock, text: 'text-ink-muted', fill: 'bg-sunken', weight: 'bold' },
  waiting: { label: 'Not run', icon: CircleDashed, text: 'text-ink-muted', fill: 'bg-sunken', weight: 'bold' },
}

export function StatusIcon({ status, className = 'size-4' }) {
  const { icon: Icon, text, spin, weight } = STATUS[status]
  return (
    <Icon
      weight={weight}
      className={`${className} ${text} shrink-0 ${spin ? 'animate-spin [animation-duration:1.1s]' : ''}`}
      aria-hidden="true"
    />
  )
}

/** variant "pill": tinted background, for lists and headers. "plain": icon + text only, for dense rows. */
export default function StatusBadge({ status, label, variant = 'pill', className = '' }) {
  const { label: defaultLabel } = STATUS[status]
  const pill = variant === 'pill'
  // Only "Failed" is loud. Other states keep their colored icon but neutral text and fill.
  const loud = status === 'failed'
  const text = loud ? 'text-fail' : 'text-ink-muted'
  const fill = loud ? 'bg-fail-soft' : 'inset-fill'
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
