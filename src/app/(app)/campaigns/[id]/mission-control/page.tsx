import { notFound } from 'next/navigation'
import { getCampaign } from '@/lib/db/campaigns'
import { getActionsByCampaign } from '@/lib/db/campaign-actions'
import MissionControl from '@/components/campaigns/MissionControl'

export const metadata = {
  title: 'Mission Control | LaunchPad',
  description: 'Execute your campaign day by day',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MissionControlPage({ params }: PageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  const actions = await getActionsByCampaign(id)

  return <MissionControl campaign={campaign} initialActions={actions} />
}
