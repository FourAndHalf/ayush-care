import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// Used by scripts/prerender.mjs to write real HTML for crawlers.
export const render = (path) => renderToString(<App path={path} />)
