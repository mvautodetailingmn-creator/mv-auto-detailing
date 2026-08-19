import { useCallback, useEffect, useState } from 'react'
import { supabase, NOT_CONFIGURED_MESSAGE } from '../lib/supabaseClient'

// Fetches the single business_settings row (business hours). Shared by the
// booking wizard (to know which times to offer) and the admin dashboard
// (to edit them).
export function useBusinessSettings() {
  const [settings, setSettings] = useState(null)
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
      .from('business_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (fetchError) {
      setError('Could not load business hours. Please refresh and try again.')
    } else {
      setError('')
      setSettings(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { settings, loading, error, refetch }
}
