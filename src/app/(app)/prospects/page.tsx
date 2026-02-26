import { createClient } from '@/lib/supabase/server'
import { Users, Plus, Upload, Sparkles } from 'lucide-react'
import { getProspects } from '@/lib/db/prospects'
import { getCampaigns } from '@/lib/db/campaigns'
import ProspectList from '@/components/prospects/ProspectList'
import Link from 'next/link'

export default async function ProspectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch prospects and campaigns
  const prospects = await getProspects()
  const campaigns = await getCampaigns()

  const hasProspects = prospects.length > 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Prospects
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your prospect list and campaigns
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {hasProspects && (
              <>
                <Link
                  href="/prospects/score"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Score Prospects
                </Link>
                <Link
                  href="/prospects/find-similar"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Find More Like These
                </Link>
              </>
            )}
            <Link
              href="/prospects/import"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Link>
            <Link
              href="/prospects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Prospect
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      {hasProspects ? (
        <ProspectList
          initialProspects={prospects}
          campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
        />
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12">
          <div className="text-center">
            <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No prospects yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start by importing prospects from a CSV file or add them manually.
              You can also create a campaign to organize your outreach.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/prospects/import"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Upload className="h-5 w-5" />
                Import from CSV
              </Link>
              <Link
                href="/prospects/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Manually
              </Link>
              <Link
                href="/campaigns/new"
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                Create Campaign
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
