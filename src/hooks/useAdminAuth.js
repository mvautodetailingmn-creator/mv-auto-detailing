import { useEffect, useState } from 'react'
import { supabase, NOT_CONFIGURED_MESSAGE } from '../lib/supabaseClient'

// Wraps Supabase Auth so the admin dashboard only renders once a real,
// logged-in session exists. The actual admin user is created once by you
// in the Supabase dashboard (see SETUP.md) — there is no public sign-up.
export function useAdminAuth() {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = (email, password) => {
    if (!supabase) return Promise.resolve({ error: { message: NOT_CONFIGURED_MESSAGE } })
    return supabase.auth.signInWithPassword({ email, password })
  }
  const signOut = () => supabase?.auth.signOut()

  return { session, loading: session === undefined, signIn, signOut }
}
