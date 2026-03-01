import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import AppShell from '@/components/AppShell'

/**
 * Protected server-component layout for authenticated app routes.
 * Performs the auth check and delegates rendering to the AppShell
 * client component which manages the mobile sidebar toggle state.
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

  return <AppShell>{children}</AppShell>
}
