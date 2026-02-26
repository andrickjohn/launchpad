'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, Check, AlertCircle, Download } from 'lucide-react'
import Link from 'next/link'
import type { Campaign } from '@/lib/types/database'

interface CSVImportProps {
  campaigns: Campaign[]
}

interface ParsedProspect {
  email: string
  name?: string
  company?: string
  title?: string
  phone?: string
  linkedin_url?: string
  website?: string
  notes?: string
}

export default function CSVImport({ campaigns }: CSVImportProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [campaignId, setCampaignId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedProspect[]>([])
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }
      setFile(selectedFile)
      setError(null)
      setParsed([])
      setImportResult(null)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())

        if (lines.length < 2) {
          setError('CSV file must contain headers and at least one data row')
          return
        }

        // Parse headers
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

        // Check for required email column
        const emailIndex = headers.findIndex((h) =>
          ['email', 'email address', 'e-mail'].includes(h)
        )

        if (emailIndex === -1) {
          setError('CSV must contain an "email" column')
          return
        }

        // Map other columns
        const nameIndex = headers.findIndex((h) => ['name', 'full name', 'fullname'].includes(h))
        const companyIndex = headers.findIndex((h) =>
          ['company', 'company name', 'organization'].includes(h)
        )
        const titleIndex = headers.findIndex((h) => ['title', 'job title', 'position'].includes(h))
        const phoneIndex = headers.findIndex((h) => ['phone', 'telephone', 'mobile'].includes(h))
        const linkedinIndex = headers.findIndex((h) =>
          ['linkedin', 'linkedin url', 'linkedin_url'].includes(h)
        )
        const websiteIndex = headers.findIndex((h) => ['website', 'url', 'company url'].includes(h))

        // Parse data rows
        const prospects: ParsedProspect[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))

          const email = values[emailIndex]
          if (!email) continue // Skip rows without email

          prospects.push({
            email,
            name: nameIndex !== -1 ? values[nameIndex] : undefined,
            company: companyIndex !== -1 ? values[companyIndex] : undefined,
            title: titleIndex !== -1 ? values[titleIndex] : undefined,
            phone: phoneIndex !== -1 ? values[phoneIndex] : undefined,
            linkedin_url: linkedinIndex !== -1 ? values[linkedinIndex] : undefined,
            website: websiteIndex !== -1 ? values[websiteIndex] : undefined,
          })
        }

        setParsed(prospects)
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.')
        console.error('CSV parse error:', err)
      }
    }

    reader.onerror = () => {
      setError('Failed to read file')
    }

    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (parsed.length === 0) {
      setError('No prospects to import')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/prospects/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospects: parsed,
          campaign_id: campaignId || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to import prospects')
      }

      const result = await response.json()
      setImportResult(result)

      if (result.success > 0) {
        // Redirect after a delay to show success message
        setTimeout(() => {
          router.push('/prospects')
          router.refresh()
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csv = 'email,name,company,title,phone,linkedin,website\nexample@company.com,John Doe,Acme Inc,CEO,+1-555-1234,https://linkedin.com/in/johndoe,https://acme.com'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prospects-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* CSV Template */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              CSV Format
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Your CSV should include an "email" column (required). Optional columns: name, company,
              title, phone, linkedin, website.
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Upload CSV File
        </h2>

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">CSV files only</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {parsed.length} prospects found
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null)
                  setParsed([])
                  setImportResult(null)
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Campaign Selection */}
            <div>
              <label
                htmlFor="campaign"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Assign to Campaign (Optional)
              </label>
              <select
                id="campaign"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">No Campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            {parsed.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preview (first 5 rows)
                </h3>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Company
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {parsed.slice(0, 5).map((prospect, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-sm text-slate-900 dark:text-white">
                            {prospect.email}
                          </td>
                          <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                            {prospect.name || '—'}
                          </td>
                          <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                            {prospect.company || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {importResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                Import Complete
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Successfully imported {importResult.success} prospects
                {importResult.failed > 0 && ` (${importResult.failed} failed)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleImport}
          disabled={loading || parsed.length === 0 || !!importResult}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-4 w-4" />
          {loading ? 'Importing...' : `Import ${parsed.length} Prospects`}
        </button>

        <Link
          href="/prospects"
          className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </Link>
      </div>
    </div>
  )
}
