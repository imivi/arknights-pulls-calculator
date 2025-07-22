import "normalize.css"
import './styles/globals.scss'
import "./fonts/Inter.ttf"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <script defer src={import.meta.env.VITE_UMAMI_SCRIPT} data-website-id={import.meta.env.VITE_UMAMI_WEBSITE_ID}></script>
  </StrictMode>,
)
