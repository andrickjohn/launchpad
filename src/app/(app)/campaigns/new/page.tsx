import CampaignWizard from '@/components/campaigns/CampaignWizard'

export const metadata = {
  title: 'New Campaign | LaunchPad',
  description: 'Create a new campaign with AI-powered launch brief',
}

export default function NewCampaignPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CampaignWizard />
    </div>
  )
}
