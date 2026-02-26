import { createClient } from '@/lib/supabase/server'
import { UserPlus, Mail, MessageSquare, Target, FileText } from 'lucide-react'

interface ActivityFeedProps {
  userId: string
}

export default async function ActivityFeed({ userId }: ActivityFeedProps) {
  const supabase = await createClient()

  // Fetch recent prospects
  const { data: recentProspects } = await supabase
    .from('prospects')
    .select('id, name, email, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent outreach
  const { data: recentOutreach } = await supabase
    .from('outreach')
    .select(`
      id,
      channel,
      status,
      subject,
      created_at,
      sent_at,
      prospect:prospects(name, email)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Combine and sort all activities
  const activities: Array<{
    type: string
    title: string
    subtitle: string
    timestamp: string
    icon: any
    color: string
  }> = []

  recentProspects?.forEach((p) => {
    activities.push({
      type: 'prospect_added',
      title: 'New prospect added',
      subtitle: p.name || p.email,
      timestamp: p.created_at,
      icon: UserPlus,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    })
  })

  recentOutreach?.forEach((o) => {
    const prospectData = o.prospect as any
    const prospectName = prospectData?.name || prospectData?.email || 'Unknown'
    activities.push({
      type: 'outreach',
      title: `${o.channel} ${o.status}`,
      subtitle: `To ${prospectName}${o.subject ? `: ${o.subject}` : ''}`,
      timestamp: o.sent_at || o.created_at,
      icon: o.channel === 'email' ? Mail : MessageSquare,
      color:
        o.status === 'sent'
          ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
          : 'text-slate-600 bg-slate-50 dark:bg-slate-700',
    })
  })

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const topActivities = activities.slice(0, 15)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
        Recent Activity
      </h2>

      {topActivities.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">
            No activity yet. Start by creating a campaign and adding prospects!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topActivities.map((activity, i) => {
            const Icon = activity.icon
            return (
              <div key={i} className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {activity.subtitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
