import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ztdkreblmgscvdnzvzeh.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZGtyZWJsbWdzY3Zkbnp2emVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTcxNjAsImV4cCI6MjA3MzIzMzE2MH0.-xH1ML6hHKIWFw-OoEJdlhZffnNkY8gS3ez0Hxrm70M'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Alternative configuration (commented out)
// const supabaseUrl = 'https://zgkfnfoffajerzovuxbg.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpna2ZuZm9mZmFqZXJ6b3Z1eGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Mzg2MTUsImV4cCI6MjA3MzMxNDYxNX0.mLnlWmf9-uaoTYPXuRD0mvRHD5jtaDvwQQNfkSSlXro'