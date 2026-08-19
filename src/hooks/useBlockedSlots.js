import { useCallback, useEffect, useState } from 'react'
import { supabase, NOT_CONFIGURED_MESSAGE } from '../lib/supabaseClient'

export function useBlockedSlots() {
  const [blockedSlots, setBlockedSlots] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('blocked_slots')
      .select('*')
      .order('blocked_date', { ascending: true })
    setBlockedSlots(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addBlock = async ({ date, time, reason }) => {
    if (!supabase) return new Error(NOT_CONFIGURED_MESSAGE)
    const { error } = await supabase.from('blocked_slots').insert({
      blocked_date: date,
      blocked_time: time || null,
      reason: reason || null,
    })
    if (!error) refetch()
    return error
  }

  const removeBlock = async (id) => {
    if (!supabase) return new Error(NOT_CONFIGURED_MESSAGE)
    const { error } = await supabase.from('blocked_slots').delete().eq('id', id)
    if (!error) refetch()
    return error
  }

  return { blockedSlots, loading, addBlock, removeBlock, refetch }
}
