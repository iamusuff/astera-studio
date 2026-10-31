import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'

import { useMediaQuery } from '../hooks/useMediaQuery.js'

/*
  Appearance: 'system' (follow the device), 'light' or 'dark'.
  The choice is remembered on this device. index.html applies the same rule
  before the first paint, so dark mode never flashes white on load.
*/
const STORAGE_KEY = 'astera-theme'
const ThemeContext = createContext(null)

function readPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'system'
  } catch {
    return 'system' // private mode or blocked storage: just follow the device
  }
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    // Status bar / browser chrome color matches the page background
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#f2f2f7')
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      /* storage unavailable: the choice lasts for this visit only */
    }
  }, [theme, preference])

  const value = useMemo(() => ({ preference, setPreference, theme }), [preference, theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
