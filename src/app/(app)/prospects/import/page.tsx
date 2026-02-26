import { createClient } from '@/lib/supabase/server'
import { Upload } from 'lucide-react'
import { getCampaigns } from '@/lib/db/campaigns'
import CSVImport from '@/components/prospects/CSVImport'

export default async function ImportProspectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch campaigns for the dropdown
  const campaigns = await getCampaigns()

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Upload className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Import Prospects from CSV
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Upload a CSV file to bulk import prospects. Supports Apify output format and generic CSV.
        </p>
      </div>

      <CSVImport campaigns={campaigns} />
    </div>
  )
}
