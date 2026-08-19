import { useState } from 'react'
import { supabase, NOT_CONFIGURED_MESSAGE } from '../lib/supabaseClient'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import { formatDateLabel, formatTimeLabel } from '../lib/booking'
import DateTimeStep from '../components/booking/DateTimeStep'

const inputClass =
  'w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-electric/60 focus:bg-white/[0.07]'

const labelClass = 'block text-xs font-medium text-white/50 mb-1.5'

const primaryButtonClass =
  'inline-flex justify-center items-center rounded-full bg-electric text-black btn-glow hover:brightness-110 transition-all px-8 py-3.5 font-semibold disabled:opacity-40 disabled:pointer-events-none cursor-pointer'

const secondaryButtonClass =
  'inline-flex justify-center items-center rounded-full glass glow-hover transition-all px-8 py-3.5 font-medium text-white/80 cursor-pointer'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d\s()+.-]{7,}$/

// Cleans up a Postgres RAISE EXCEPTION message (which arrives prefixed with
// something like "P0001: ") into plain text for display.
function friendlyError(error) {
  return error?.message?.replace(/^.*?:\s*/, '') || 'Something went wrong. Please try again.'
}

function Card({ children }) {
  return <div className="glass rounded-2xl p-6 sm:p-10">{children}</div>
}

export default function ManageBookingApp() {
  const { settings } = useBusinessSettings()

  // 'lookup' -> 'found' -> ('rescheduling' -> 'rescheduled') | 'cancelled'
  const [phase, setPhase] = useState('lookup')
  const [form, setForm] = useState({ email: '', phone: '', date: '' })
  const [errors, setErrors] = useState({})
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)
  const [booking, setBooking] = useState(null)

  const [actionError, setActionError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [rescheduling, setRescheduling] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validateForm = () => {
    const next = {}
    if (!form.email.trim() || !EMAIL_PATTERN.test(form.email.trim())) next.email = 'Enter the email you booked with'
    if (!form.phone.trim() || !PHONE_PATTERN.test(form.phone.trim())) next.phone = 'Enter the phone number you booked with'
    if (!form.date) next.date = 'Enter your appointment date'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!supabase) {
      setLookupError(NOT_CONFIGURED_MESSAGE)
      return
    }
    if (!validateForm()) return

    setLooking(true)
    setLookupError('')

    const { data, error } = await supabase.rpc('find_customer_booking', {
      p_email: form.email.trim(),
      p_phone: form.phone.trim(),
      p_appointment_date: form.date,
    })

    setLooking(false)

    if (error) {
      setLookupError(friendlyError(error))
      return
    }
    if (!data || data.length === 0) {
      setLookupError(
        "We couldn't find a booking matching those details. Double-check your info, or reach out by phone or Instagram."
      )
      return
    }

    setBooking(data[0])
    setPhase('found')
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment? This cannot be undone.')) return

    setCancelling(true)
    setActionError('')

    const { error } = await supabase.rpc('cancel_customer_booking', {
      p_email: form.email.trim(),
      p_phone: form.phone.trim(),
      p_appointment_date: form.date,
    })

    setCancelling(false)

    if (error) {
      setActionError(friendlyError(error))
      return
    }
    setPhase('cancelled')
  }

  const handleConfirmReschedule = async () => {
    setRescheduling(true)
    setActionError('')

    const { error } = await supabase.rpc('reschedule_customer_booking', {
      p_email: form.email.trim(),
      p_phone: form.phone.trim(),
      p_appointment_date: form.date,
      p_new_date: newDate,
      p_new_time: newTime,
    })

    setRescheduling(false)

    if (error) {
      setActionError(friendlyError(error))
      return
    }
    setPhase('rescheduled')
  }

  const startOver = () => {
    setPhase('lookup')
    setForm({ email: '', phone: '', date: '' })
    setErrors({})
    setLookupError('')
    setBooking(null)
    setActionError('')
    setNewDate('')
    setNewTime('')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <a href="/" className="block text-center mb-6 font-display text-lg text-white">
          MV <span className="text-electric">Auto Detailing</span>
        </a>

        {phase === 'lookup' && (
          <Card>
            <h1 className="font-display text-xl font-semibold text-white mb-1">Manage Your Booking</h1>
            <p className="text-sm text-white/50 mb-6">
              Enter the info you booked with to cancel or reschedule your appointment.
            </p>

            <form onSubmit={handleLookup} noValidate className="space-y-4">
              <div>
                <label className={labelClass}>Email address</label>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="jane@example.com"
                />
                {errors.email && <p className="text-xs text-red-300/90 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone number</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="(555) 555-5555"
                />
                {errors.phone && <p className="text-xs text-red-300/90 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className={labelClass}>Appointment date</label>
                <input type="date" className={inputClass} value={form.date} onChange={set('date')} />
                {errors.date && <p className="text-xs text-red-300/90 mt-1">{errors.date}</p>}
              </div>

              {lookupError && <p className="text-sm text-amber-300/90">{lookupError}</p>}

              <button type="submit" disabled={looking} className={`${primaryButtonClass} w-full`}>
                {looking ? 'Looking up…' : 'Find My Booking'}
              </button>
            </form>
          </Card>
        )}

        {phase === 'found' && booking && (
          <Card>
            <h1 className="font-display text-xl font-semibold text-white mb-1">
              Hi {booking.customer_name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-white/50 mb-6">Here's your upcoming appointment.</p>

            <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2 text-sm">
              <p className="text-white/70"><span className="text-white/40">Service: </span>{booking.service_name}</p>
              <p className="text-white/70">
                <span className="text-white/40">Vehicle: </span>
                {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model}
              </p>
              <p className="text-white/70"><span className="text-white/40">Date: </span>{formatDateLabel(booking.appointment_date)}</p>
              <p className="text-white/70"><span className="text-white/40">Time: </span>{formatTimeLabel(booking.appointment_time)}</p>
              <p className="text-white/70"><span className="text-white/40">Address: </span>{booking.address}</p>
            </div>

            {actionError && <p className="text-sm text-amber-300/90 mt-4">{actionError}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError('')
                  setPhase('rescheduling')
                }}
                className={primaryButtonClass}
              >
                Reschedule
              </button>
              <button type="button" onClick={handleCancel} disabled={cancelling} className={secondaryButtonClass}>
                {cancelling ? 'Cancelling…' : 'Cancel Appointment'}
              </button>
            </div>

            <button type="button" onClick={startOver} className="block mt-5 text-xs text-white/40 hover:text-white/70">
              ← Look up a different booking
            </button>
          </Card>
        )}

        {phase === 'rescheduling' && booking && (
          <Card>
            <h1 className="font-display text-xl font-semibold text-white mb-1">Pick a new time</h1>
            <p className="text-sm text-white/50 mb-6">
              Your current appointment ({formatDateLabel(booking.appointment_date)} at{' '}
              {formatTimeLabel(booking.appointment_time)}) will move to whatever you pick below.
            </p>

            {settings ? (
              <DateTimeStep
                settings={settings}
                date={newDate}
                time={newTime}
                onChangeDate={(d) => {
                  setNewDate(d)
                  setNewTime('')
                }}
                onSelectTime={setNewTime}
                onBack={() => setPhase('found')}
              />
            ) : (
              <p className="text-sm text-white/50">Loading availability…</p>
            )}

            {newDate && newTime && (
              <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between gap-4">
                <p className="text-sm text-white/70">
                  New time: <span className="text-white">{formatDateLabel(newDate)} at {formatTimeLabel(newTime)}</span>
                </p>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  disabled={rescheduling}
                  className={`${primaryButtonClass} py-2.5 px-5 shrink-0`}
                >
                  {rescheduling ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            )}

            {actionError && <p className="text-sm text-amber-300/90 mt-4">{actionError}</p>}
          </Card>
        )}

        {phase === 'cancelled' && (
          <Card>
            <div className="text-center py-4">
              <h1 className="font-display text-xl font-semibold text-white">Appointment Cancelled</h1>
              <p className="mt-2 text-sm text-white/55">
                Your appointment has been cancelled. That time is now open for other customers.
              </p>
              <a href="/#booking" className={`${primaryButtonClass} mt-6`}>
                Book a New Appointment
              </a>
            </div>
          </Card>
        )}

        {phase === 'rescheduled' && (
          <Card>
            <div className="text-center py-4">
              <h1 className="font-display text-xl font-semibold text-white">Appointment Rescheduled</h1>
              <p className="mt-2 text-sm text-white/55">
                You're all set for {formatDateLabel(newDate)} at {formatTimeLabel(newTime)}.
              </p>
              <a href="/" className={`${primaryButtonClass} mt-6`}>
                Back to Site
              </a>
            </div>
          </Card>
        )}

        <a href="/" className="block mt-6 text-center text-xs text-white/40 hover:text-white/70">
          ← Back to website
        </a>
      </div>
    </div>
  )
}
