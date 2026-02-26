'use client'

import { useState } from 'react'
import { Search, Filter, ArrowUpDown, Mail, Phone, Building2, ExternalLink, Sparkles, Loader2, Users, TrendingUp } from 'lucide-react'
import type { ProspectWithCampaign } from '@/lib/types/database'
import Link from 'next/link'

interface ProspectListProps {
  initialProspects: ProspectWithCampaign[]
  campaigns: Array<{ id: string; name: string }>
}

export default function ProspectList({ initialProspects, campaigns }: ProspectListProps) {
  const [prospects, setProspects] = useState(initialProspects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [campaignFilter, setCampaignFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'score'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set())
  const [isScoring, setIsScoring] = useState(false)
  const [scoringResults, setScoringResults] = useState<Record<string, { score: number; reasoning: string }> | null>(null)
  const [isFindingSimilar, setIsFindingSimilar] = useState(false)
  const [similarityResults, setSimilarityResults] = useState<{
    patterns: string[]
    recommended_sources: Array<{
      source: string
      method: string
      query: string
      estimated_volume: string
      apify_actor: string | null
    }>
    apify_queries: string[]
  } | null>(null)

  // Filter and sort prospects
  const filteredProspects = prospects
    .filter((prospect) => {
      const matchesSearch =
        searchQuery === '' ||
        prospect.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.company?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter

      const matchesCampaign =
        campaignFilter === 'all' || prospect.campaign_id === campaignFilter

      return matchesSearch && matchesStatus && matchesCampaign
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'score':
          comparison = (a.score || 0) - (b.score || 0)
          break
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const toggleSort = (field: 'created_at' | 'name' | 'score') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const toggleSelectAll = () => {
    if (selectedProspects.size === filteredProspects.length) {
      setSelectedProspects(new Set())
    } else {
      setSelectedProspects(new Set(filteredProspects.map(p => p.id)))
    }
  }

  const toggleSelectProspect = (id: string) => {
    const newSelected = new Set(selectedProspects)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedProspects(newSelected)
  }

  const handleScoreProspects = async () => {
    if (selectedProspects.size === 0) {
      alert('Please select at least one prospect to score')
      return
    }

    setIsScoring(true)
    setScoringResults(null)

    try {
      const response = await fetch('/api/prospects/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospect_ids: Array.from(selectedProspects),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to score prospects')
      }

      const data = await response.json()
      setScoringResults(data.scores)

      // Update prospects in state with new scores
      setProspects(prevProspects =>
        prevProspects.map(p => {
          if (data.scores[p.id]) {
            return { ...p, score: data.scores[p.id].score }
          }
          return p
        })
      )

      // Clear selection
      setSelectedProspects(new Set())

    } catch (error) {
      console.error('Error scoring prospects:', error)
      alert('Failed to score prospects. Please try again.')
    } finally {
      setIsScoring(false)
    }
  }

  const handleFindSimilar = async () => {
    if (selectedProspects.size === 0) {
      alert('Please select at least one prospect to analyze')
      return
    }

    setIsFindingSimilar(true)
    setSimilarityResults(null)

    try {
      const response = await fetch('/api/prospects/find-similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospect_ids: Array.from(selectedProspects),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to find similar prospects')
      }

      const data = await response.json()
      setSimilarityResults(data.analysis)

      // Clear selection
      setSelectedProspects(new Set())

    } catch (error) {
      console.error('Error finding similar prospects:', error)
      alert('Failed to find similar prospects. Please try again.')
    } finally {
      setIsFindingSimilar(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'responded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'converted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'not_interested':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      {selectedProspects.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-primary-900 dark:text-primary-100">
              {selectedProspects.size} prospect{selectedProspects.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleScoreProspects}
                disabled={isScoring || isFindingSimilar}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isScoring ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Scoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Score These
                  </>
                )}
              </button>
              <button
                onClick={handleFindSimilar}
                disabled={isScoring || isFindingSimilar}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isFindingSimilar ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Find More Like These
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Results */}
      {scoringResults && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            Scoring Complete!
          </h3>
          <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
            {Object.values(scoringResults).map((result, i) => (
              <div key={i}>
                Score {result.score}: {result.reasoning}
              </div>
            ))}
          </div>
          <button
            onClick={() => setScoringResults(null)}
            className="mt-3 text-sm text-green-700 dark:text-green-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Similarity Results */}
      {similarityResults && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Where to Find More Prospects Like These
              </h3>
            </div>
            <button
              onClick={() => setSimilarityResults(null)}
              className="text-purple-700 dark:text-purple-300 hover:underline text-sm"
            >
              Dismiss
            </button>
          </div>

          {/* Patterns Identified */}
          <div className="mb-6">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Patterns Identified:
            </h4>
            <ul className="list-disc list-inside text-sm text-purple-800 dark:text-purple-200 space-y-1">
              {similarityResults.patterns.map((pattern, i) => (
                <li key={i}>{pattern}</li>
              ))}
            </ul>
          </div>

          {/* Recommended Sources */}
          <div className="space-y-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Recommended Sources:
            </h4>
            {similarityResults.recommended_sources.map((source, i) => (
              <div
                key={i}
                className="bg-white dark:bg-purple-950 border border-purple-200 dark:border-purple-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-semibold text-purple-900 dark:text-purple-100">
                      {source.source}
                    </h5>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {source.method}
                    </p>
                  </div>
                  <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                    Est. {source.estimated_volume}
                  </span>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 rounded p-3 mt-2">
                  <p className="text-sm font-mono text-purple-900 dark:text-purple-100">
                    {source.query}
                  </p>
                </div>
                {source.apify_actor && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    Apify Actor: {source.apify_actor}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Ready-to-use Apify Queries */}
          {similarityResults.apify_queries.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Ready-to-use Apify Queries:
              </h4>
              <div className="space-y-2">
                {similarityResults.apify_queries.map((query, i) => (
                  <div
                    key={i}
                    className="bg-purple-100 dark:bg-purple-900 rounded p-3 text-sm font-mono text-purple-900 dark:text-purple-100"
                  >
                    {query}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search prospects by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="converted">Converted</option>
            <option value="not_interested">Not Interested</option>
          </select>
        </div>

        {/* Campaign Filter */}
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Showing {filteredProspects.length} of {prospects.length} prospects
      </div>

      {/* Prospect Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProspects.size === filteredProspects.length && filteredProspects.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Company
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => toggleSort('score')}
              >
                <div className="flex items-center gap-2">
                  Score
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredProspects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  No prospects found matching your filters
                </td>
              </tr>
            ) : (
              filteredProspects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProspects.has(prospect.id)}
                      onChange={() => toggleSelectProspect(prospect.id)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <Link
                        href={`/prospects/${prospect.id}`}
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {prospect.name || 'Unnamed'}
                      </Link>
                      {prospect.title && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {prospect.title}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${prospect.email}`} className="hover:underline">
                          {prospect.email}
                        </a>
                      </div>
                      {prospect.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a href={`tel:${prospect.phone}`} className="hover:underline">
                            {prospect.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prospect.company && (
                      <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {prospect.company}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prospect.score !== null && (
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {prospect.score}
                        </div>
                        <div className="ml-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${prospect.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        prospect.status
                      )}`}
                    >
                      {prospect.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {prospect.campaign?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/prospects/${prospect.id}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
