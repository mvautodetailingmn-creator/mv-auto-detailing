import { formatDateLabel, formatTimeLabel } from '../../lib/booking'
import { primaryButtonClass, secondaryButtonClass } from './shared'

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/10 last:border-0">
      <span className="text-xs uppercase tracking-wide text-white/40 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  )
}

export default function ReviewStep({ data, onBack, onEdit, onSubmit, submitting, submitError }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-white mb-1">Review your booking</h3>
      <p className="text-sm text-white/50 mb-6">Double-check everything before you confirm.</p>

      <div className="glass rounded-xl p-5">
        <Row label="Service" value={data.service?.name} />
        <Row label="Vehicle" value={`${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleType})`} />
        <Row label="Date" value={formatDateLabel(data.date)} />
        <Row label="Time" value={formatTimeLabel(data.time)} />
        <Row label="Name" value={data.name} />
        <Row label="Phone" value={data.phone} />
        <Row label="Email" value={data.email} />
        <Row label="Address" value={data.address} />
        {data.notes && <Row label="Notes" value={data.notes} />}
      </div>

      <button type="button" onClick={onEdit} className="mt-3 text-xs text-electric hover:underline">
        Edit details
      </button>

      {submitError && (
        <p className="mt-4 text-sm text-red-300/90 glass rounded-lg px-4 py-3 border-red-400/20">
          {submitError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onSubmit} disabled={submitting} className={primaryButtonClass}>
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
        <button type="button" onClick={onBack} disabled={submitting} className={secondaryButtonClass}>
          Back
        </button>
      </div>
    </div>
  )
}
