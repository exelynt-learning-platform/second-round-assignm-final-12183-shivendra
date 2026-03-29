// ---------------------------------------------------------------------------
// main.jsx — Application entry point
// ---------------------------------------------------------------------------
// Mounts the React app into the DOM. Uses createRoot (React 18+) and wraps
// the App in StrictMode to highlight potential problems during development.
// ---------------------------------------------------------------------------

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
