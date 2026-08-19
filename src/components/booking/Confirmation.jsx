import { formatDateLabel, formatTimeLabel } from '../../lib/booking'
import { primaryButtonClass } from './shared'

export default function Confirmation({ booking, onBookAnother }) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto h-14 w-14 rounded-full bg-electric/10 border border-electric/30 flex items-center justify-center mb-6">
        <svg className="text-electric" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3 className="font-display text-2xl font-semibold text-white">Booking Confirmed!</h3>
      <p className="mt-2 text-white/55 max-w-sm mx-auto">
        Thanks, {booking.name.split(' ')[0]} — we'll see you then. A member of our team may reach out
        if we need anything else before your appointment.
      </p>

      <div className="mt-8 glass rounded-xl p-6 max-w-sm mx-auto text-left space-y-2.5">
        <p className="text-sm text-white/70">
          <span className="text-white/40">Service: </span>
          {booking.service?.name}
        </p>
        <p className="text-sm text-white/70">
          <span className="text-white/40">Vehicle: </span>
          {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}
        </p>
        <p className="text-sm text-white/70">
          <span className="text-white/40">Date: </span>
          {formatDateLabel(booking.date)}
        </p>
        <p className="text-sm text-white/70">
          <span className="text-white/40">Time: </span>
          {formatTimeLabel(booking.time)}
        </p>
      </div>

      <button type="button" onClick={onBookAnother} className={`${primaryButtonClass} mt-8`}>
        Book Another Appointment
      </button>
    </div>
  )
}
