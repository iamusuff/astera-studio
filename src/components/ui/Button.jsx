import { Link } from 'react-router'

/*
  iOS button styles:
    primary    filled blue: the one main action on a screen
    secondary  tinted: blue text on a light blue fill
    gray       neutral fill for quiet actions
    ghost      plain blue text (iOS "plain" button)
    danger     tinted red
    onColor    light button for colored banners

  Sizes follow the input device, not the screen width: 44px targets for
  touch (pointer: coarse), compact ones for a mouse (pointer: fine).
  Every button dips slightly while pressed, so a tap always gets feedback.
*/
const base =
  'inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap ' +
  'transition-[transform,background-color,color,opacity] duration-200 ease-out-ui active:scale-[0.96] ' +
  'disabled:pointer-events-none disabled:opacity-40'

const variants = {
  primary: 'bg-tint text-white hover:bg-[#0077ed]',
  secondary: 'bg-tint-soft text-tint-text hover:bg-tint-soft/70',
  gray: 'bg-sunken text-ink hover:bg-line',
  ghost: 'text-tint-text hover:bg-tint-soft',
  danger: 'bg-fail-soft text-fail hover:bg-fail-soft/70',
  // on a colored banner (warning, error): a light button that doesn't mix with the banner color
  onColor: 'bg-surface/90 text-tint-text shadow-[0_1px_2px_rgb(0_0_0/0.06)] hover:bg-surface',
}

const sizes = {
  md: 'h-11 rounded-xl px-4 text-[15px] pointer-fine:h-9 pointer-fine:rounded-[10px] pointer-fine:px-3.5 pointer-fine:text-sm',
  sm: 'h-11 rounded-xl px-3.5 text-sm pointer-fine:h-8 pointer-fine:rounded-lg pointer-fine:px-3 pointer-fine:text-[13px]',
  icon: 'size-11 rounded-full pointer-fine:size-8',
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
