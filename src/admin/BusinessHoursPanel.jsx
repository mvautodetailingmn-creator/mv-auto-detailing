import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import { WEEKDAY_NAMES } from '../lib/booking'

const inputClass =
  'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-electric/60 focus:bg-white/[0.07]'

const INTERVALS = [30, 45, 60, 90, 120, 240]

function formatIntervalLabel(mins) {
  if (mins < 60) return `${mins} minutes`
  const hours = mins / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hour${hours === 1 ? '' : 's'}`
}

export default function BusinessHoursPanel() {
  const { settings, loading, error: loadError, refetch } = useBusinessSettings()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (settings) {
      setForm({
        start_time: settings.start_time.slice(0, 5),
        last_start_time: settings.last_start_time.slice(0, 5),
        slot_interval_minutes: settings.slot_interval_minutes,
        closed_weekdays: settings.closed_weekdays,
      })
    }
  }, [settings])

  const toggleWeekday = (day) => {
    setForm((f) => ({
      ...f,
      closed_weekdays: f.closed_weekdays.includes(day)
        ? f.closed_weekdays.filter((d) => d !== day)
        : [...f.closed_weekdays, day],
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (form.start_time >= form.last_start_time) {
      setError('The last start time must be after the start time.')
      return
    }
    setSaving(true)
    setError('')
    setSaved(false)
    const { error: updateError } = await supabase
      .from('business_settings')
      .update({
        start_time: form.start_time,
        last_start_time: form.last_start_time,
        slot_interval_minutes: form.slot_interval_minutes,
        closed_weekdays: form.closed_weekdays,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
    setSaving(false)
    if (updateError) {
      setError('Could not save changes. Please try again.')
    } else {
      setSaved(true)
      refetch()
    }
  }

  if (loading) return <p className="text-white/50 text-sm">Loading…</p>
  if (loadError || !form) return <p className="text-red-300/90 text-sm">{loadError || 'Could not load business hours.'}</p>

  return (
    <form onSubmit={handleSave} className="glass rounded-xl p-6 max-w-lg">
      <h3 className="font-display text-base font-semibold text-white mb-1">Business hours</h3>
      <p className="text-sm text-white/50 mb-6">
        Controls which dates and times customers can select when booking.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-white/50 mb-1">Earliest appointment</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Latest appointment start</label>
          <input
            type="time"
            value={form.last_start_time}
            onChange={(e) => setForm((f) => ({ ...f, last_start_time: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs text-white/50 mb-1">Time between appointment slots</label>
        <select
          value={form.slot_interval_minutes}
          onChange={(e) => setForm((f) => ({ ...f, slot_interval_minutes: Number(e.target.value) }))}
          className={inputClass}
        >
          {INTERVALS.map((mins) => (
            <option key={mins} value={mins}>
              {formatIntervalLabel(mins)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className="block text-xs text-white/50 mb-2">Closed on</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_NAMES.map((name, day) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleWeekday(day)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                form.closed_weekdays.includes(day)
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'border-white/15 text-white/60 hover:border-white/30'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-300/90 mt-4">{error}</p>}
      {saved && <p className="text-sm text-electric mt-4">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 rounded-full bg-electric text-black px-6 py-2.5 text-sm font-semibold btn-glow hover:brightness-110 disabled:opacity-50 cursor-pointer"
      >
        {saving ? 'Saving…' : 'Save Business Hours'}
      </button>
    </form>
  )
}
