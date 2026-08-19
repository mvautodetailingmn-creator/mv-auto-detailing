import { useState } from 'react'
import AppointmentsPanel from './AppointmentsPanel'
import BlockedDatesPanel from './BlockedDatesPanel'
import BusinessHoursPanel from './BusinessHoursPanel'

const TABS = [
  { key: 'appointments', label: 'Appointments' },
  { key: 'blocked', label: 'Blocked Dates & Times' },
  { key: 'hours', label: 'Business Hours' },
]

export default function Dashboard({ signOut }) {
  const [tab, setTab] = useState('appointments')

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="glass sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <p className="font-display text-lg">
          MV <span className="text-electric">Auto Detailing</span>{' '}
          <span className="text-white/40 text-sm font-body font-normal">Admin</span>
        </p>
        <div className="flex items-center gap-4">
          <a href="/" className="text-xs text-white/50 hover:text-white/80">
            View site
          </a>
          <button
            type="button"
            onClick={signOut}
            className="text-xs rounded-full border border-white/15 px-4 py-2 text-white/70 hover:bg-white/10 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                tab === t.key ? 'bg-electric text-black' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'appointments' && <AppointmentsPanel />}
        {tab === 'blocked' && <BlockedDatesPanel />}
        {tab === 'hours' && <BusinessHoursPanel />}
      </main>
    </div>
  )
}
