import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import MetricsPanel from '@/components/dashboard/MetricsPanel'
import UpcomingSchedule from '@/components/dashboard/UpcomingSchedule'

export const metadata = {
  title: 'Dashboard | LaunchPad',
  description: 'Your launch command center',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)

  const activeCampaigns = campaigns?.filter((c) => c.is_active) || []

  // Fetch prospects
  const { data: prospects } = await supabase
    .from('prospects')
    .select('*')
    .eq('user_id', user.id)

  // Fetch outreach
  const { data: outreach } = await supabase
    .from('outreach')
    .select('*')
    .eq('user_id', user.id)

  const sentEmails = outreach?.filter((o) => o.status === 'sent' || o.status === 'delivered') || []
  const openedEmails = outreach?.filter((o) => o.opened_at) || []
  const repliedEmails = outreach?.filter((o) => o.replied_at) || []

  // Fetch templates
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('usage_count', { ascending: false })
    .limit(3)

  // Fetch upcoming scheduled
  const { data: scheduled } = await supabase
    .from('outreach')
    .select(`
      *,
      prospect:prospects(id, name, email, company)
    `)
    .eq('user_id', user.id)
    .eq('status', 'scheduled')
    .not('scheduled_at', 'is', null)
    .order('scheduled_at', { ascending: true })
    .limit(10)

  // Calculate metrics
  const convertedProspects = prospects?.filter((p) => p.status === 'converted').length || 0
  const stats = {
    activeCampaigns: activeCampaigns.length,
    totalProspects: prospects?.length || 0,
    newProspects: prospects?.filter((p) => p.status === 'new').length || 0,
    contactedProspects: prospects?.filter((p) => p.status === 'contacted').length || 0,
    respondedProspects: prospects?.filter((p) => p.status === 'responded').length || 0,
    convertedProspects,
    emailsSent: sentEmails.length,
    emailsOpened: openedEmails.length,
    emailsReplied: repliedEmails.length,
    responseRate: sentEmails.length > 0 ? ((repliedEmails.length / sentEmails.length) * 100).toFixed(1) : '0',
    openRate: sentEmails.length > 0 ? ((openedEmails.length / sentEmails.length) * 100).toFixed(1) : '0',
    conversionRate: prospects && prospects.length > 0 ? ((convertedProspects / prospects.length) * 100).toFixed(1) : '0',
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Your launch command center
        </p>
      </div>

      {/* Overview Cards */}
      <DashboardOverview stats={stats} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Activity Feed + Schedule */}
        <div className="lg:col-span-2 space-y-8">
          <ActivityFeed userId={user.id} />
          <UpcomingSchedule scheduled={scheduled || []} />
        </div>

        {/* Right: Metrics */}
        <div className="space-y-8">
          <MetricsPanel stats={stats} templates={templates || []} />
        </div>
      </div>
    </div>
  )
}
