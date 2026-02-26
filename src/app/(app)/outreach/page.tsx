import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OutreachTabs from '@/components/outreach/OutreachTabs'

export const metadata = {
  title: 'Outreach | LaunchPad',
  description: 'Manage your outreach campaigns',
}

export default async function OutreachPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch drafts
  const { data: drafts } = await supabase
    .from('outreach')
    .select(`
      *,
      prospect:prospects(id, name, email, company)
    `)
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  // Fetch scheduled
  const { data: scheduled } = await supabase
    .from('outreach')
    .select(`
      *,
      prospect:prospects(id, name, email, company)
    `)
    .eq('user_id', user.id)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })

  // Fetch templates
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('usage_count', { ascending: false })

  // Fetch prospects for dropdown
  const { data: prospects } = await supabase
    .from('prospects')
    .select('id, name, email, company')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Outreach
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Compose emails, schedule sequences, and manage social drafts
        </p>
      </div>

      <OutreachTabs
        initialDrafts={drafts || []}
        initialScheduled={scheduled || []}
        initialTemplates={templates || []}
        prospects={prospects || []}
      />
    </div>
  )
}
