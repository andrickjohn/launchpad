import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import Sidebar from '@/components/Sidebar'

/**
 * Protected layout for authenticated app routes
 * Includes sidebar navigation
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getAuthUser(supabase)

  // Redirect to login if not authenticated (unless auth is disabled for dev)
  if (!user && process.env.DISABLE_AUTH !== 'true') {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  )
}
