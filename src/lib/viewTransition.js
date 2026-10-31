import { flushSync } from 'react-dom'

/*
  Animated state changes with the View Transitions API: the browser takes a
  picture of the page before and after `update`, and CSS animates between
  the two (see "View transitions" in index.css).

  Browsers without the API, and people with reduce motion on, get the change
  instantly. flushSync makes React apply the update inside the callback, so
  the "after" picture is the new state.
*/
const canAnimate = () =>
  typeof document !== 'undefined' &&
  'startViewTransition' in document &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

function run(kind, update, { prepare, done } = {}) {
  if (!canAnimate()) {
    update()
    return
  }
  const root = document.documentElement
  root.dataset.transition = kind
  const transition = document.startViewTransition(() => {
    flushSync(update)
    prepare?.()
  })
  transition.finished.finally(() => {
    delete root.dataset.transition
    done?.()
  })
}

/*
  Theme change: light bursts out of the control that was tapped and the new
  theme spreads across the page in a soft-edged circle from that point.
  `origin` is the tapped element (or null: the burst starts top-right).
*/
export function switchThemeWithLight(origin, update) {
  const rect = origin?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40
  const y = rect ? rect.top + rect.height / 2 : 40
  const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  const root = document.documentElement
  root.style.setProperty('--vt-x', `${x}px`)
  root.style.setProperty('--vt-y', `${y}px`)
  root.style.setProperty('--vt-reach', `${Math.ceil(reach)}px`)

  // The burst of light is its own layer above the page, only in the "after" picture.
  let flare
  run('theme', update, {
    prepare: () => {
      flare = document.createElement('div')
      flare.className = 'theme-flare'
      flare.setAttribute('aria-hidden', 'true')
      document.body.append(flare)
    },
    done: () => flare?.remove(),
  })
}

// Reset demo data: the whole page cross-fades into its fresh state.
export function crossFade(update) {
  run('fade', update)
}
