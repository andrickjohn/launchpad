import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import { getCampaigns } from '@/lib/db/campaigns'
import ProspectForm from '@/components/prospects/ProspectForm'

export default async function NewProspectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch campaigns for the dropdown
  const campaigns = await getCampaigns()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Plus className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Add New Prospect
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Enter prospect details manually
        </p>
      </div>

      <ProspectForm campaigns={campaigns} />
    </div>
  )
}
