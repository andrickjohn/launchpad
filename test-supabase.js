// Test script to verify Supabase connection
const { createBrowserClient } = require('@supabase/ssr')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

console.log('Testing Supabase Connection...')
console.log('URL:', url)
console.log('Key:', key.substring(0, 20) + '...')

const supabase = createBrowserClient(url, key)

supabase.auth.signInWithOtp({
  email: 'test@example.com',
  options: {
    emailRedirectTo: 'http://localhost:3000/auth/callback',
  },
}).then(result => {
  console.log('\n✅ SUCCESS:', result)
}).catch(error => {
  console.error('\n❌ ERROR:', error)
})
