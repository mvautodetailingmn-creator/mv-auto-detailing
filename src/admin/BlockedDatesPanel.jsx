import { useState } from 'react'
import { useBlockedSlots } from '../hooks/useBlockedSlots'
import { formatDateLabel, formatTimeLabel, todayISODate } from '../lib/booking'

const inputClass =
  'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-electric/60 focus:bg-white/[0.07]'

export default function BlockedDatesPanel() {
  const { blockedSlots, loading, addBlock, removeBlock } = useBlockedSlots()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!date) {
      setError('Choose a date to block.')
      return
    }
    setSaving(true)
    setError('')
    const err = await addBlock({ date, time, reason })
    setSaving(false)
    if (err) {
      setError('Could not save. That date/time may already be blocked.')
    } else {
      setDate('')
      setTime('')
      setReason('')
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="glass rounded-xl p-5 mb-8">
        <h3 className="font-display text-base font-semibold text-white mb-4">Block off time</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1">Date</label>
            <input
              type="date"
              min={todayISODate()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Time (optional)</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
            <p className="text-[11px] text-white/35 mt-1">Leave blank to block the entire day.</p>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Vacation"
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-300/90 mt-3">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-full bg-electric text-black px-6 py-2.5 text-sm font-semibold btn-glow hover:brightness-110 disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving…' : 'Block This Time'}
        </button>
      </form>

      <h3 className="font-display text-base font-semibold text-white mb-3">Currently blocked</h3>
      {loading && <p className="text-white/50 text-sm">Loading…</p>}
      {!loading && blockedSlots.length === 0 && (
        <p className="text-white/50 text-sm">Nothing is blocked off right now.</p>
      )}
      <div className="space-y-2">
        {blockedSlots.map((slot) => (
          <div key={slot.id} className="glass rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm text-white/80">
              <span className="font-medium">{formatDateLabel(slot.blocked_date)}</span>
              <span className="text-white/50">
                {' — '}
                {slot.blocked_time ? formatTimeLabel(slot.blocked_time) : 'All day'}
              </span>
              {slot.reason && <span className="text-white/40 italic"> ({slot.reason})</span>}
            </div>
            <button
              type="button"
              onClick={() => removeBlock(slot.id)}
              className="text-xs text-white/50 hover:text-red-300 shrink-0 cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
