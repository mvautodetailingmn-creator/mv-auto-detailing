import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'
import ManageBookingApp from './manage/ManageBookingApp.jsx'

// No router library — this is a single-page marketing site plus a couple of
// separate standalone screens, so a plain path check keeps things simple.
// Your host must redirect unknown paths (like /admin) to index.html for
// this to work after a page refresh — see the _redirects / vercel.json
// files and SETUP.md for how that's configured.
const path = window.location.pathname
const isAdmin = path.startsWith('/admin')
const isManageBooking = path.startsWith('/manage-booking')

function Root() {
  if (isAdmin) return <AdminApp />
  if (isManageBooking) return <ManageBookingApp />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
