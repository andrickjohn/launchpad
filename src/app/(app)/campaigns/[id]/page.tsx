import { notFound } from 'next/navigation'
import { getCampaign } from '@/lib/db/campaigns'
import { CheckCircle, Sparkles, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Campaign Details | LaunchPad',
  description: 'View campaign launch brief',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface LaunchBrief {
  channels: Array<{
    name: string
    rank: number
    rationale: string
    methods: string[]
    estimated_volume: string
    expected_response_rate: string
    apify_actor: string | null
    sample_queries: string[]
  }>
  first_week_plan: Array<{
    day: string
    tasks: string[]
  }>
  key_insights: string[]
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  const launchBrief = campaign.launch_brief as unknown as LaunchBrief | null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/prospects"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prospects
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-slate-600 dark:text-slate-400">
                {campaign.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/prospects?campaign=${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Prospects
            </Link>
            {!campaign.is_active && (
              <Link
                href={`/campaigns/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Campaign Details
        </h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Product
            </dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">
              {campaign.product_description || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Target Buyer
            </dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">
              {campaign.target_buyer || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Price Point
            </dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">
              {campaign.price_point || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Geography
            </dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">
              {campaign.geography || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Status
            </dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                campaign.is_active
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}>
                {campaign.is_active ? 'Active' : 'Draft'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Created
            </dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-white">
              {new Date(campaign.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Launch Brief */}
      {launchBrief ? (
        <div className="space-y-6">
          {/* Key Insights */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">
              Key Insights
            </h3>
            <ul className="space-y-2">
              {launchBrief.key_insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-primary-800 dark:text-primary-200">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Channels */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recommended Channels (Ranked)
            </h3>
            <div className="space-y-4">
              {launchBrief.channels.map((channel) => (
                <div
                  key={channel.name}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm">
                          {channel.rank}
                        </span>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {channel.name}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        {channel.rationale}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-slate-600 dark:text-slate-400">
                        Est. Volume: <span className="font-medium">{channel.estimated_volume}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        Response: <span className="font-medium">{channel.expected_response_rate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Methods:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {channel.methods.map((method, i) => (
                        <span
                          key={i}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  {channel.sample_queries.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Sample Queries:
                      </h5>
                      <div className="space-y-1">
                        {channel.sample_queries.map((query, i) => (
                          <div
                            key={i}
                            className="text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-2 rounded font-mono"
                          >
                            {query}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {channel.apify_actor && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Apify Actor: {channel.apify_actor}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* First Week Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              First Week Action Plan
            </h3>
            <div className="space-y-4">
              {launchBrief.first_week_plan.map((day) => (
                <div key={day.day} className="border-l-4 border-primary-600 pl-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{day.day}</h4>
                  <ul className="space-y-1">
                    {day.tasks.map((task, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12">
          <div className="text-center">
            <Sparkles className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Launch Brief Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              This campaign doesn't have a launch brief yet. Generate one to get AI-powered
              channel recommendations and a first-week action plan.
            </p>
            {!campaign.is_active && (
              <Link
                href={`/campaigns/${id}/edit`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                Generate Launch Brief
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
