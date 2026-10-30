import { useSyncExternalStore } from 'react'

// True while a CSS media query matches. Used only where a screen needs a
// different component per device (side panel vs bottom sheet); plain layout
// changes are done with Tailwind breakpoints instead.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

// Matches the Tailwind breakpoints in use: md = 768px, xl = 1280px.
export const useIsPhone = () => !useMediaQuery('(min-width: 768px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1280px)')
