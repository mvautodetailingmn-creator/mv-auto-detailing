import { createClient } from '@supabase/supabase-js'

// These come from your .env file (see .env.example). Vite only exposes
// variables prefixed with VITE_ to the browser, and the anon key is safe
// to ship in frontend code — it's a public key that identifies your
// project, not a secret. Access to data is controlled by the Row Level
// Security policies defined in supabase/schema.sql, not by hiding this key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    'Missing Supabase environment variables. Create a .env file based on .env.example ' +
      'and restart the dev server. See SETUP.md for step-by-step instructions.'
  )
}

// `supabase` is null until .env is configured, rather than throwing, so the
// rest of the site (hero, services, about, contact) keeps working even
// before the database is set up — only booking/admin need it.
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export const NOT_CONFIGURED_MESSAGE =
  'Online booking is not connected to a database yet. (Site owner: see SETUP.md.)'
