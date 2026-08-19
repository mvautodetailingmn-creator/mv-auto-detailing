import { useState } from 'react'
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './shared'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d\s()+.-]{7,}$/

export default function DetailsStep({ value, onChange, onContinue, onBack }) {
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value })

  const validate = () => {
    const next = {}
    if (!value.name.trim()) next.name = 'Name is required'
    if (!value.phone.trim()) next.phone = 'Phone number is required'
    else if (!PHONE_PATTERN.test(value.phone.trim())) next.phone = 'Enter a valid phone number'
    if (!value.email.trim()) next.email = 'Email is required'
    else if (!EMAIL_PATTERN.test(value.email.trim())) next.email = 'Enter a valid email address'
    if (!value.vehicleYear.trim()) next.vehicleYear = 'Required'
    if (!value.vehicleMake.trim()) next.vehicleMake = 'Required'
    if (!value.vehicleModel.trim()) next.vehicleModel = 'Required'
    if (!value.address.trim()) next.address = 'Service address is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) onContinue()
  }

  const errorText = (field) => errors[field] && <p className="text-xs text-red-300/90 mt-1">{errors[field]}</p>

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="font-display text-xl font-semibold text-white mb-1">Your information</h3>
      <p className="text-sm text-white/50 mb-6">Tell us who to expect and where to meet you.</p>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input className={inputClass} value={value.name} onChange={set('name')} placeholder="Jane Smith" />
            {errorText('name')}
          </div>
          <div>
            <label className={labelClass}>Phone number</label>
            <input
              type="tel"
              className={inputClass}
              value={value.phone}
              onChange={set('phone')}
              placeholder="(555) 555-5555"
            />
            {errorText('phone')}
          </div>
        </div>

        <div>
          <label className={labelClass}>Email address</label>
          <input
            type="email"
            className={inputClass}
            value={value.email}
            onChange={set('email')}
            placeholder="jane@example.com"
          />
          {errorText('email')}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Vehicle year</label>
            <input className={inputClass} value={value.vehicleYear} onChange={set('vehicleYear')} placeholder="2020" />
            {errorText('vehicleYear')}
          </div>
          <div>
            <label className={labelClass}>Make</label>
            <input className={inputClass} value={value.vehicleMake} onChange={set('vehicleMake')} placeholder="Honda" />
            {errorText('vehicleMake')}
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input className={inputClass} value={value.vehicleModel} onChange={set('vehicleModel')} placeholder="Civic" />
            {errorText('vehicleModel')}
          </div>
        </div>

        <div>
          <label className={labelClass}>Service address</label>
          <input
            className={inputClass}
            value={value.address}
            onChange={set('address')}
            placeholder="Where should we come detail your vehicle?"
          />
          {errorText('address')}
          <p className="mt-1.5 text-xs text-white/40">
            Please have a water source and a standard electrical outlet accessible at this location.
          </p>
        </div>

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            rows={3}
            className={inputClass}
            value={value.notes}
            onChange={set('notes')}
            placeholder="Anything else we should know?"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="submit" className={primaryButtonClass}>
          Review Booking
        </button>
        <button type="button" onClick={onBack} className={secondaryButtonClass}>
          Back
        </button>
      </div>
    </form>
  )
}
