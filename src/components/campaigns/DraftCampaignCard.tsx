'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, AlertCircle } from 'lucide-react'
import type { Campaign } from '@/lib/types/database'
import { useToast } from '@/components/ui/Toast'

interface DraftCampaignCardProps {
    campaign: Campaign
}

export default function DraftCampaignCard({ campaign }: DraftCampaignCardProps) {
    const router = useRouter()
    const { success, error } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        if (!showConfirm) {
            setShowConfirm(true)
            // Reset confirmation after 3 seconds
            setTimeout(() => setShowConfirm(false), 3000)
            return
        }

        try {
            setIsDeleting(true)
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete campaign')

            success('Draft campaign deleted')
            router.refresh()
        } catch (err) {
            console.error(err)
            error('Failed to delete campaign')
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <li className="flex items-center justify-between bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 transition-all hover:shadow-md">
            <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                    {campaign.name}
                </h3>
                {campaign.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {campaign.description}
                    </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Created {new Date(campaign.created_at).toLocaleDateString()}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href={`/campaigns/${campaign.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                >
                    <Edit className="h-4 w-4" aria-hidden="true" />
                    Edit Draft
                </Link>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 ${showConfirm
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-inner'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800'
                        }`}
                    aria-label={showConfirm ? "Confirm delete campaign" : "Delete campaign"}
                >
                    {showConfirm ? (
                        <>
                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                            Confirm Delete?
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                        </>
                    )}
                </button>
            </div>
        </li>
    )
}
