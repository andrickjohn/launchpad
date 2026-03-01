import { notFound } from 'next/navigation'
import { getCampaign } from '@/lib/db/campaigns'
import { getActionsByCampaign } from '@/lib/db/campaign-actions'
import ActionReviewPage from '@/components/campaigns/ActionReviewPage'

export const metadata = {
  title: 'Review Actions | LaunchPad',
  description: 'Review and approve campaign action items',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  const actions = await getActionsByCampaign(id)

  return <ActionReviewPage campaign={campaign} initialActions={actions} />
}
