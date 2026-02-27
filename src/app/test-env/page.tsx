export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Test</h1>
      <div className="space-y-2">
        <p>NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl || 'NOT SET'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {hasAnonKey ? 'SET' : 'NOT SET'}</p>
        <p>SUPABASE_SERVICE_ROLE_KEY: {hasServiceKey ? 'SET' : 'NOT SET'}</p>
      </div>
    </div>
  )
}
