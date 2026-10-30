import { Link } from 'react-router'

/*
  Sizes adapt to the input device, not the screen width:
  touch (pointer: coarse) gets 44px targets, mouse (pointer: fine) gets compact ones.
  An iPad and a laptop can be the same width but need different targets.

  Buttons shrink slightly while pressed, so a tap always gets instant feedback.
*/
const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap ' +
  'transition-[transform,background-color,color,border-color] duration-150 ease-out-ui active:scale-[0.97] ' +
  'disabled:pointer-events-none disabled:opacity-45'

const variants = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-sunken',
  ghost: 'text-ink hover:bg-sunken',
  danger: 'border border-fail/40 bg-surface text-fail hover:bg-fail-soft',
}

const sizes = {
  md: 'h-11 px-4 text-[15px] pointer-fine:h-9 pointer-fine:px-3.5 pointer-fine:text-sm',
  sm: 'h-11 px-3 text-sm pointer-fine:h-8 pointer-fine:px-2.5 pointer-fine:text-[13px]',
  icon: 'size-11 pointer-fine:size-9',
}

export function buttonClasses({ variant = 'secondary', size = 'md', className = '' } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}

export default function Button({ variant, size, className, type = 'button', ...props }) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />
}

// Same look, but navigates. Navigation should be a link, not a button with onClick.
export function ButtonLink({ variant, size, className, ...props }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />
}
