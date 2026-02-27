'use client'

import { useState, useEffect } from 'react'
import { Loader2, Sparkles, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Campaign } from '@/lib/types/database'

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

interface ModelInfo {
  tier: string
  id: string
  name: string
  version: string
}

interface CampaignWizardProps {
  existingCampaign?: Campaign
}

export default function CampaignWizard({ existingCampaign }: CampaignWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [launchBrief, setLaunchBrief] = useState<LaunchBrief | null>(null)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)

  // Form data
  const [campaignName, setCampaignName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [targetBuyer, setTargetBuyer] = useState('')
  const [pricePoint, setPricePoint] = useState('')
  const [geography, setGeography] = useState('')
  const [description, setDescription] = useState('')

  // Load existing campaign data
  useEffect(() => {
    if (existingCampaign) {
      setCampaignName(existingCampaign.name || '')
      setDescription(existingCampaign.description || '')
      setProductDescription(existingCampaign.product_description || '')
      setTargetBuyer(existingCampaign.target_buyer || '')
      setPricePoint(existingCampaign.price_point || '')
      setGeography(existingCampaign.geography || '')
      if (existingCampaign.launch_brief) {
        setLaunchBrief(existingCampaign.launch_brief as LaunchBrief)
        setStep(3)
      }
    }
  }, [existingCampaign])

  const handleGenerateBrief = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/campaigns/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_description: productDescription,
          target_buyer: targetBuyer,
          price_point: pricePoint,
          geography,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate brief')
      }

      const data = await response.json()
      setLaunchBrief(data.brief)
      setModelInfo(data.model)
      setStep(3)
    } catch (error) {
      console.error('Error generating brief:', error)
      alert('Failed to generate launch brief. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const url = existingCampaign
        ? `/api/campaigns/${existingCampaign.id}`
        : '/api/campaigns'

      const response = await fetch(url, {
        method: existingCampaign ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName || 'Draft Campaign',
          description,
          product_description: productDescription,
          target_buyer: targetBuyer,
          price_point: pricePoint,
          geography,
          launch_brief: null,
          is_active: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      const data = await response.json()
      router.push('/prospects')
      router.refresh() // Force server component to refetch
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save draft. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCampaign = async () => {
    setIsSaving(true)
    try {
      const url = existingCampaign
        ? `/api/campaigns/${existingCampaign.id}`
        : '/api/campaigns'

      const response = await fetch(url, {
        method: existingCampaign ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName,
          description,
          product_description: productDescription,
          target_buyer: targetBuyer,
          price_point: pricePoint,
          geography,
          launch_brief: launchBrief,
          is_active: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save campaign')
      }

      const data = await response.json()
      const campaignId = existingCampaign?.id || data.campaign.id
      router.push(`/prospects?campaign=${campaignId}`)
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Failed to save campaign. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Campaign Info' },
            { num: 2, label: 'Product Details' },
            { num: 3, label: 'Launch Brief' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s.num
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{s.num}</span>
                  )}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    step >= s.num ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step > s.num ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Campaign Info */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Create New Campaign
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Q1 Dentist Outreach"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about this campaign..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!campaignName.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next: Product Details
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Product Details */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Product & Market Details
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Tell us about your product and target market. AI will analyze this and create your
            personalized launch strategy.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Product Description *
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="e.g., HIPAA-compliant practice management software for dental offices with built-in patient communication tools"
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Buyer *
              </label>
              <textarea
                value={targetBuyer}
                onChange={(e) => setTargetBuyer(e.target.value)}
                placeholder="e.g., Dental practice owners and office managers at practices with 2-10 dentists"
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Price Point
                </label>
                <input
                  type="text"
                  value={pricePoint}
                  onChange={(e) => setPricePoint(e.target.value)}
                  placeholder="e.g., $299/month"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Geography
                </label>
                <input
                  type="text"
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                  placeholder="e.g., United States"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={!campaignName.trim() || isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </button>

                <button
                  onClick={handleGenerateBrief}
                  disabled={!productDescription.trim() || !targetBuyer.trim() || isGenerating}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Launch Brief...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Launch Brief
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Launch Brief */}
      {step === 3 && launchBrief && (
        <div className="space-y-6">
          {/* AI Model Info Badge */}
          {modelInfo && (
            <div className="flex items-center justify-end gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>
                Generated by <span className="font-medium text-slate-900 dark:text-white">{modelInfo.name}</span> ({modelInfo.version})
              </span>
            </div>
          )}

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

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={handleSaveCampaign}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Campaign...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
