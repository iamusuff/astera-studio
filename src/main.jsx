import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// IBM Plex Sans is bundled (not loaded from Google Fonts) so the app also works
// offline and inside the single-file build. Latin only, three weights.
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import './styles/index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
