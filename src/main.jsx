import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/i18n/index.js' // Initialize i18n before anything renders

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
