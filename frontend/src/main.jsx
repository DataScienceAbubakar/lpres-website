import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import api from './api/client'
import { registerServiceWorker } from './serviceWorkerRegistration'
import { initOfflineSync } from './utils/offlineSync'

// Register PWA Service Worker
registerServiceWorker();

// Initialize automated offline sync listener
initOfflineSync(api);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

