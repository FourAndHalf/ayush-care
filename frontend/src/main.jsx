import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// Pages pre-rendered at build time are hydrated; anything else renders fresh.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
