import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, NOT_CONFIGURED_MESSAGE } from '../lib/supabaseClient'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import { secondaryButtonClass } from './booking/shared'
import ServiceStep from './booking/ServiceStep'
import VehicleStep from './booking/VehicleStep'
import DateTimeStep from './booking/DateTimeStep'
import DetailsStep from './booking/DetailsStep'
import ReviewStep from './booking/ReviewStep'
import Confirmation from './booking/Confirmation'

const STEP_LABELS = ['Service', 'Vehicle', 'Date & Time', 'Your Info', 'Review']

const emptyData = {
  service: null,
  vehicleType: '',
  date: '',
  time: '',
  name: '',
  phone: '',
  email: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  address: '',
  notes: '',
}

export default function Booking({ selectedService }) {
  const { settings, loading: settingsLoading, error: settingsError } = useBusinessSettings()
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState(emptyData)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // If a customer clicks "Book This Package" on a specific service card,
  // pre-select it and skip straight to the vehicle step.
  useEffect(() => {
    if (selectedService) {
      setData((d) => ({ ...d, service: selectedService }))
      setStepIndex(1)
    }
  }, [selectedService])

  const goTo = (index) => {
    setStepIndex(index)
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async () => {
    if (!supabase) {
      setSubmitError(NOT_CONFIGURED_MESSAGE)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    const { data: newId, error } = await supabase.rpc('create_booking', {
      p_customer_name: data.name,
      p_customer_phone: data.phone,
      p_customer_email: data.email,
      p_vehicle_year: data.vehicleYear,
      p_vehicle_make: data.vehicleMake,
      p_vehicle_model: data.vehicleModel,
      p_vehicle_type: data.vehicleType,
      p_service_name: data.service?.name ?? '',
      p_service_price: data.service?.price ?? '',
      p_address: data.address,
      p_notes: data.notes,
      p_appointment_date: data.date,
      p_appointment_time: data.time,
    })

    setSubmitting(false)

    if (error || !newId) {
      setSubmitError(
        error?.message?.replace(/^.*?:\s*/, '') ||
          'Something went wrong while booking your appointment. Please try again.'
      )
      return
    }

    setConfirmedBooking(data)
    setStepIndex(5)
  }

  const handleBookAnother = () => {
    setData(emptyData)
    setConfirmedBooking(null)
    setStepIndex(0)
  }

  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <ServiceStep
            value={data.service}
            onSelect={(service) => {
              setData((d) => ({ ...d, service }))
              goTo(1)
            }}
          />
        )
      case 1:
        return (
          <VehicleStep
            value={data.vehicleType}
            onSelect={(vehicleType) => {
              setData((d) => ({ ...d, vehicleType }))
              goTo(2)
            }}
            onBack={() => goTo(0)}
          />
        )
      case 2:
        // Only the date/time step actually needs business_settings, so it's
        // the only step gated on it having loaded successfully.
        if (settingsLoading) {
          return <p className="text-white/50 text-sm">Loading availability…</p>
        }
        if (settingsError || !settings) {
          return (
            <div>
              <p className="text-red-300/90 text-sm">{settingsError || 'Could not load booking settings.'}</p>
              <button type="button" onClick={() => goTo(1)} className={`${secondaryButtonClass} mt-6`}>
                Back
              </button>
            </div>
          )
        }
        return (
          <DateTimeStep
            settings={settings}
            date={data.date}
            time={data.time}
            onChangeDate={(date) => setData((d) => ({ ...d, date, time: '' }))}
            onSelectTime={(time) => {
              setData((d) => ({ ...d, time }))
              goTo(3)
            }}
            onBack={() => goTo(1)}
          />
        )
      case 3:
        return (
          <DetailsStep
            value={data}
            onChange={setData}
            onContinue={() => goTo(4)}
            onBack={() => goTo(2)}
          />
        )
      case 4:
        return (
          <ReviewStep
            data={data}
            onBack={() => goTo(3)}
            onEdit={() => goTo(3)}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
          />
        )
      default:
        return null
    }
  }

  return (
    <section id="booking" className="relative bg-black py-28 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-electric/10 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-electric text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Book Now
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Schedule Your Detail
          </h2>
          <p className="mt-4 text-white/55">
            Pick a service, choose a time that works for you, and we'll take it from there.
          </p>
        </motion.div>

        {stepIndex < 5 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i <= stepIndex ? 'bg-electric' : 'bg-white/15'
                  }`}
                />
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-px w-4 sm:w-8 ${i < stepIndex ? 'bg-electric/50' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-2xl p-6 sm:p-10"
        >
          {stepIndex === 5 && confirmedBooking ? (
            <Confirmation booking={confirmedBooking} onBookAnother={handleBookAnother} />
          ) : (
            renderStep()
          )}
        </motion.div>
      </div>
    </section>
  )
}
