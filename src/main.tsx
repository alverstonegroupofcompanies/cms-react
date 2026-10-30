import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './clinic-theme.css'
import './patient-hub.css'
import './patient-portal.css'
import './patient-homepage.css'
import './components/motion/motion.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
