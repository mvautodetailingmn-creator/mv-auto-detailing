// Small date/time helpers shared by the booking wizard and the admin dashboard.
// Keeping these in one place avoids timezone bugs from creeping in twice.

/** Today's date as a local 'YYYY-MM-DD' string (not UTC — avoids off-by-one-day bugs). */
export function todayISODate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Minutes since midnight for a 'HH:MM' or 'HH:MM:SS' string. */
export function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTimeStr(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** '13:00' -> '1:00 PM' */
export function formatTimeLabel(t) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

/** 'YYYY-MM-DD' -> 'Monday, January 5, 2026' (parsed as local time, not UTC). */
export function formatDateLabel(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function weekdayOfISODate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** All bookable start times for a day, given the business_settings row. */
export function generateTimeSlots(settings) {
  if (!settings) return []
  const start = timeToMinutes(settings.start_time)
  const end = timeToMinutes(settings.last_start_time)
  const step = settings.slot_interval_minutes
  const slots = []
  for (let t = start; t <= end; t += step) {
    slots.push(minutesToTimeStr(t))
  }
  return slots
}

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
