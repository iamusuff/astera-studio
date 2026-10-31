import { useEffect } from 'react'

// Names the browser tab after the screen ("Dashboard – Astera Studio"). Screen
// readers announce it on navigation, and it tells open tabs apart.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – Astera Studio` : 'Astera Studio'
  }, [title])
}
