import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔗 Connecting to Supabase...')
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'undefined')
console.log('Key available:', !!supabaseAnonKey)

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('https://')
)

if (!isSupabaseConfigured) {
  console.error('❌ Missing or invalid Supabase environment variables!')
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment / Netlify settings.')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

if (supabase) {
  console.log('✅ Supabase client initialized successfully!')
}