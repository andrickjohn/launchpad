import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProspect } from '@/lib/db/prospects'
import ProspectHeader from '@/components/prospects/ProspectHeader'
import ProspectTimeline from '@/components/prospects/ProspectTimeline'

interface ProspectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProspectDetailPage({ params }: ProspectDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get prospect data
  const prospect = await getProspect(id)

  if (!prospect) {
    notFound()
  }

  // Get all outreach/touchpoints for this prospect
  const { data: outreach } = await supabase
    .from('outreach')
    .select('*')
    .eq('prospect_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProspectHeader prospect={prospect} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Activity Timeline
        </h2>
        <ProspectTimeline prospect={prospect} outreach={outreach || []} />
      </div>
    </div>
  )
}
