import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import { Target, Users, Plus, Upload, Sparkles, FileText } from 'lucide-react'
import { getProspects } from '@/lib/db/prospects'
import { getCampaigns } from '@/lib/db/campaigns'
import { getActionStats } from '@/lib/db/campaign-actions'
import ProspectList from '@/components/prospects/ProspectList'
import DraftCampaignCard from '@/components/campaigns/DraftCampaignCard'
import ActiveCampaignCard from '@/components/campaigns/ActiveCampaignCard'
import SmartListBuilder from '@/components/prospects/SmartListBuilder'
import ScrapeJobQueue from '@/components/prospects/ScrapeJobQueue'
import Link from 'next/link'

export default async function ProspectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await getAuthUser(supabase)

  // if no user, we could return null or redirect, but layout usually protects this route
  if (!user) return null

  // Fetch prospects and campaigns
  const prospects = await getProspects()
  const campaigns = await getCampaigns()

  // Fetch active scrape jobs
  const { data: scrapeJobs } = await supabase
    .from('scrape_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Separate draft and active campaigns
  const draftCampaigns = campaigns.filter(c => !c.is_active)
  const activeCampaigns = campaigns.filter(c => c.is_active)

  // Fetch stats for all active campaigns
  const activeStatsList = await Promise.all(
    activeCampaigns.map(async (campaign) => {
      const stats = await getActionStats(campaign.id)
      return { id: campaign.id, stats }
    })
  )

  const hasProspects = prospects.length > 0
  const hasDrafts = draftCampaigns.length > 0
  const hasActiveCampaigns = activeCampaigns.length > 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary-600" aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Campaigns
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your active campaigns and prospect lists
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {hasProspects && (
              <>
                <Link
                  href="/prospects/score"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Score Prospects
                </Link>
                <Link
                  href="/prospects/find-similar"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
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

      {/* Draft Campaigns Section */}
      {hasDrafts && (
        <div className="mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                Draft Campaigns
              </h2>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                ({draftCampaigns.length})
              </span>
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              These campaigns are saved but not yet finalized. Continue editing to generate launch briefs.
            </p>
            <ul className="space-y-3">
              {draftCampaigns.map((campaign) => (
                <DraftCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Active Campaigns Section */}
      {hasActiveCampaigns && (
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-green-600 dark:text-green-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Active Campaigns
              </h2>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                ({activeCampaigns.length})
              </span>
            </div>
            <ul className="space-y-3">
              {activeCampaigns.map((campaign) => {
                const stats = activeStatsList.find((s) => s.id === campaign.id)?.stats
                return (
                  <ActiveCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    initialStats={stats}
                  />
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Smart List Builder & Job Queue */}
      <div className="mb-8 space-y-8">
        <SmartListBuilder />
        <ScrapeJobQueue initialJobs={scrapeJobs || []} />
      </div>

      {/* Prospect Lists Management Section */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Prospect Lists & Management
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            View, filter, and import leads for your active outreach campaigns.
          </p>
        </div>

        {hasProspects ? (
          <ProspectList
            initialProspects={prospects}
            campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
          />
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12">
            <div className="text-center">
              <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No prospects yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Start by importing prospects from a CSV file or add them manually.
                You can also create a campaign to organize your outreach.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/prospects/import"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Upload className="h-5 w-5" aria-hidden="true" />
                  Import from CSV
                </Link>
                <Link
                  href="/prospects/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  Add Manually
                </Link>
                <Link
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Create Campaign
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
