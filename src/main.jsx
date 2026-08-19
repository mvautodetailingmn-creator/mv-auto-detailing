import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'

// No router library — this is a single-page marketing site plus one
// separate admin screen, so a plain path check keeps things simple.
// Your host must redirect unknown paths (like /admin) to index.html for
// this to work after a page refresh — see the _redirects / vercel.json
// files and SETUP.md for how that's configured.
const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </StrictMode>,
)
