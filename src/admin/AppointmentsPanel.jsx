import { useMemo, useState } from 'react'
import { useBookings } from '../hooks/useBookings'
import { formatDateLabel, formatTimeLabel, todayISODate } from '../lib/booking'

const FILTERS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
]

function matchesFilter(booking, filter, today) {
  if (filter === 'upcoming') return booking.status === 'confirmed' && booking.appointment_date >= today
  if (filter === 'completed') return booking.status === 'completed'
  if (filter === 'cancelled') return booking.status === 'cancelled'
  return true
}

const statusBadge = {
  confirmed: 'bg-electric/10 text-electric border-electric/25',
  completed: 'bg-white/10 text-white/60 border-white/15',
  cancelled: 'bg-red-500/10 text-red-300 border-red-500/25',
}

export default function AppointmentsPanel() {
  const { bookings, loading, error, updateStatus } = useBookings()
  const [filter, setFilter] = useState('upcoming')
  const [actioningId, setActioningId] = useState(null)
  const today = todayISODate()

  const grouped = useMemo(() => {
    const filtered = bookings.filter((b) => matchesFilter(b, filter, today))
    const groups = new Map()
    for (const booking of filtered) {
      if (!groups.has(booking.appointment_date)) groups.set(booking.appointment_date, [])
      groups.get(booking.appointment_date).push(booking)
    }
    return Array.from(groups.entries())
  }, [bookings, filter, today])

  const handleAction = async (id, status) => {
    setActioningId(id)
    await updateStatus(id, status)
    setActioningId(null)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-xs font-medium border transition-colors cursor-pointer ${
              filter === f.key
                ? 'bg-electric text-black border-electric'
                : 'border-white/15 text-white/60 hover:text-white hover:border-white/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-white/50 text-sm">Loading appointments…</p>}
      {error && <p className="text-red-300/90 text-sm">{error}</p>}
      {!loading && !error && grouped.length === 0 && (
        <p className="text-white/50 text-sm">No appointments in this view.</p>
      )}

      <div className="space-y-8">
        {grouped.map(([date, dayBookings]) => (
          <div key={date}>
            <h3 className="font-display text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
              {formatDateLabel(date)}
              <span className="ml-2 text-white/30 normal-case font-normal">
                ({dayBookings.length} appointment{dayBookings.length === 1 ? '' : 's'})
              </span>
            </h3>

            <div className="space-y-3">
              {dayBookings.map((b) => (
                <div key={b.id} className="glass rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {formatTimeLabel(b.appointment_time)} — {b.service_name}
                      </p>
                      <p className="text-sm text-white/60 mt-0.5">
                        {b.vehicle_year} {b.vehicle_make} {b.vehicle_model} · {b.vehicle_type}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusBadge[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-white/70">
                    <p>
                      <span className="text-white/40">Customer: </span>
                      {b.customer_name}
                    </p>
                    <p>
                      <span className="text-white/40">Phone: </span>
                      <a href={`tel:${b.customer_phone}`} className="hover:text-electric">
                        {b.customer_phone}
                      </a>
                    </p>
                    <p>
                      <span className="text-white/40">Email: </span>
                      <a href={`mailto:${b.customer_email}`} className="hover:text-electric">
                        {b.customer_email}
                      </a>
                    </p>
                    <p>
                      <span className="text-white/40">Address: </span>
                      {b.address}
                    </p>
                  </div>

                  {b.notes && (
                    <p className="mt-3 text-sm text-white/60 border-t border-white/10 pt-3">
                      <span className="text-white/40">Notes: </span>
                      {b.notes}
                    </p>
                  )}

                  {b.status === 'confirmed' && (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        disabled={actioningId === b.id}
                        onClick={() => handleAction(b.id, 'completed')}
                        className="text-xs font-medium rounded-full border border-white/15 px-4 py-2 text-white/80 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                      >
                        Mark Completed
                      </button>
                      <button
                        type="button"
                        disabled={actioningId === b.id}
                        onClick={() => {
                          if (confirm('Cancel this appointment?')) handleAction(b.id, 'cancelled')
                        }}
                        className="text-xs font-medium rounded-full border border-red-500/25 px-4 py-2 text-red-300 hover:bg-red-500/10 disabled:opacity-40 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
