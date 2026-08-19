import { useCallback, useEffect, useState } from 'react'
import { supabase, NOT_CONFIGURED_MESSAGE } from '../lib/supabaseClient'

// Admin-only: reading/updating bookings requires a logged-in session
// (enforced by the RLS policies in supabase/schema.sql), so this hook is
// only used inside the admin dashboard.
export function useBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    if (!supabase) {
      setError(NOT_CONFIGURED_MESSAGE)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (fetchError) {
      setError('Could not load appointments.')
    } else {
      setError('')
      setBookings(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const updateStatus = async (id, status) => {
    if (!supabase) return new Error(NOT_CONFIGURED_MESSAGE)
    const { error: updateError } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (!updateError) refetch()
    return updateError
  }

  return { bookings, loading, error, refetch, updateStatus }
}
