import "normalize.css"
import "./styles/global_row_styles.scss"
import './styles/globals.scss'
import "./fonts/Inter.ttf"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
