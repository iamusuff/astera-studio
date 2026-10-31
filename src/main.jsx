import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Apple devices use San Francisco (the system font). Everything else gets Inter,
// the closest match. Only the Latin file is bundled (48 KB), so it also works
// offline and keeps the single-file build small.
import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
import './styles/index.css'

import App from './App.jsx'

const font = document.createElement('style')
font.textContent = `@font-face{font-family:'Inter Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url(${interLatin}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`
document.head.appendChild(font)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
