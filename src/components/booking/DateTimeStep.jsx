import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  formatTimeLabel,
  generateTimeSlots,
  timeToMinutes,
  todayISODate,
  weekdayOfISODate,
  WEEKDAY_NAMES,
} from '../../lib/booking'
import { choiceCardClass, inputClass, secondaryButtonClass } from './shared'

export default function DateTimeStep({ settings, date, time, onChangeDate, onSelectTime, onBack }) {
  const [availableTimes, setAvailableTimes] = useState([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [dateError, setDateError] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!date || !settings) {
      setAvailableTimes([])
      return
    }

    const weekday = weekdayOfISODate(date)
    if (settings.closed_weekdays.includes(weekday)) {
      setDateError(`We're closed on ${WEEKDAY_NAMES[weekday]}s. Please choose another date.`)
      setAvailableTimes([])
      return
    }
    setDateError('')

    let cancelled = false
    setLoadingTimes(true)
    setLoadError('')

    async function loadAvailability() {
      const [blockedRes, bookedRes] = await Promise.all([
        supabase.from('blocked_slots').select('blocked_time').eq('blocked_date', date),
        supabase.rpc('get_booked_times', { p_date: date }),
      ])

      if (cancelled) return

      if (blockedRes.error || bookedRes.error) {
        setLoadError('Could not load availability for that date. Please try again.')
        setAvailableTimes([])
        setLoadingTimes(false)
        return
      }

      const wholeDayBlocked = blockedRes.data.some((row) => row.blocked_time === null)
      if (wholeDayBlocked) {
        setDateError('That date is unavailable. Please choose another date.')
        setAvailableTimes([])
        setLoadingTimes(false)
        return
      }

      const takenMinutes = new Set([
        ...blockedRes.data.filter((row) => row.blocked_time !== null).map((row) => timeToMinutes(row.blocked_time)),
        ...bookedRes.data.map((row) => timeToMinutes(row.appointment_time)),
      ])

      const isToday = date === todayISODate()
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

      const slots = generateTimeSlots(settings).filter((slot) => {
        const mins = timeToMinutes(slot)
        if (takenMinutes.has(mins)) return false
        if (isToday && mins <= nowMinutes) return false
        return true
      })

      setAvailableTimes(slots)
      setLoadingTimes(false)
    }

    loadAvailability()
    return () => {
      cancelled = true
    }
  }, [date, settings])

  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-white mb-1">Choose a date &amp; time</h3>
      <p className="text-sm text-white/50 mb-6">
        We're available {formatTimeLabel(settings.start_time)}–{formatTimeLabel(settings.last_start_time)} on
        booking days (last appointment starts at {formatTimeLabel(settings.last_start_time)}).
      </p>

      <label className="block text-xs font-medium text-white/50 mb-1.5">Date</label>
      <input
        type="date"
        min={todayISODate()}
        value={date}
        onChange={(e) => onChangeDate(e.target.value)}
        className={`${inputClass} mb-2`}
      />

      {dateError && <p className="text-sm text-amber-300/90 mt-2">{dateError}</p>}
      {loadError && <p className="text-sm text-red-300/90 mt-2">{loadError}</p>}

      {date && !dateError && !loadError && (
        <div className="mt-6">
          <p className="text-xs font-medium text-white/50 mb-1.5">Available times</p>
          {loadingTimes ? (
            <p className="text-sm text-white/40">Checking availability…</p>
          ) : availableTimes.length === 0 ? (
            <p className="text-sm text-white/50">
              No times left on that date. Please try another date.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {availableTimes.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectTime(slot)}
                  className={`${choiceCardClass(time === slot)} text-center py-3 px-2`}
                >
                  <span className="text-sm font-medium">{formatTimeLabel(slot)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={onBack} className={`${secondaryButtonClass} mt-8`}>
        Back
      </button>
    </div>
  )
}
