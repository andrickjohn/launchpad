import { notFound, redirect } from 'next/navigation'
import { getCampaign } from '@/lib/db/campaigns'
import CampaignWizard from '@/components/campaigns/CampaignWizard'

export const metadata = {
  title: 'Edit Campaign | LaunchPad',
  description: 'Edit campaign details',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  // Only allow editing draft campaigns (no launch brief)
  if (campaign.is_active && campaign.launch_brief) {
    redirect(`/prospects?campaign=${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CampaignWizard existingCampaign={campaign} />
    </div>
  )
}
