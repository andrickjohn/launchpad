'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Prospect } from '@/lib/types/database'
import { ArrowLeft, Mail, Phone, Linkedin, Globe, Building2, User, Edit, Trash2 } from 'lucide-react'

interface ProspectHeaderProps {
  prospect: Prospect
}

export default function ProspectHeader({ prospect }: ProspectHeaderProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${prospect.name || prospect.email}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/prospects/${prospect.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete prospect')

      // Redirect to prospects list
      window.location.href = '/prospects'
    } catch (error) {
      console.error('Error deleting prospect:', error)
      alert('Failed to delete prospect')
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      responded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      not_interested: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[status as keyof typeof colors] || colors.new
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/prospects"
          className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Prospects
        </Link>

        <div className="flex gap-2">
          <Link
            href={`/prospects/${prospect.id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Main prospect info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {prospect.name || 'Unnamed Prospect'}
              </h1>
              {prospect.title && prospect.company && (
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                  {prospect.title} at {prospect.company}
                </p>
              )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prospect.status)}`}>
              {prospect.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            {prospect.email && (
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Mail className="w-5 h-5 mr-3 text-slate-400" />
                <a href={`mailto:${prospect.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                  {prospect.email}
                </a>
              </div>
            )}

            {prospect.phone && (
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Phone className="w-5 h-5 mr-3 text-slate-400" />
                <a href={`tel:${prospect.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                  {prospect.phone}
                </a>
              </div>
            )}

            {prospect.company && (
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Building2 className="w-5 h-5 mr-3 text-slate-400" />
                <span>{prospect.company}</span>
              </div>
            )}

            {prospect.title && (
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <User className="w-5 h-5 mr-3 text-slate-400" />
                <span>{prospect.title}</span>
              </div>
            )}

            {prospect.linkedin_url && (
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Linkedin className="w-5 h-5 mr-3 text-slate-400" />
                <a
                  href={prospect.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}

            {prospect.website && (
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <Globe className="w-5 h-5 mr-3 text-slate-400" />
                <a
                  href={prospect.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {prospect.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Score */}
          {prospect.score !== null && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Prospect Score
              </h3>
              <div className="flex items-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {prospect.score}
                </div>
                <div className="ml-2 text-slate-500 dark:text-slate-400">/100</div>
              </div>
            </div>
          )}

          {/* Notes */}
          {prospect.notes && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Notes
              </h3>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {prospect.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex justify-between mb-2">
              <span>Added:</span>
              <span>{new Date(prospect.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{new Date(prospect.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
