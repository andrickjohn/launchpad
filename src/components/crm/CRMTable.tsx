'use client'

import { useState } from 'react'
import { CRMContact } from '@/lib/db/crm'
import { formatDistanceToNow } from 'date-fns'
import { ChevronRight, Linkedin, MessageSquare } from 'lucide-react'
import ContactSlideover from './ContactSlideover'

interface CRMTableProps {
    initialContacts: CRMContact[]
}

export default function CRMTable({ initialContacts }: CRMTableProps) {
    const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
            case 'contacted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            case 'responded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            case 'converted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            case 'not_interested': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
        }
    }

    return (
        <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Status & Touchpoints
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Campaign
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Last Activity
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {initialContacts.map((contact) => (
                        <tr
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium text-sm border border-primary-200 dark:border-primary-800">
                                        {contact.name ? contact.name.charAt(0).toUpperCase() : contact.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                            {contact.name || 'Unknown Name'}
                                        </div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            {contact.email}
                                            {contact.linkedin_url && <Linkedin className="h-3 w-3 text-blue-500" />}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit capitalize ${getStatusColor(contact.status)}`}>
                                        {contact.status.replace('_', ' ')}
                                    </span>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {contact.totalOutreachAttempts} touchpoints
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                {contact.campaign?.name ? (
                                    <span className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                                        {contact.campaign.name}
                                    </span>
                                ) : (
                                    <span className="text-slate-400 italic">Unassigned</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                {contact.lastActivityDate
                                    ? formatDistanceToNow(new Date(contact.lastActivityDate), { addSuffix: true })
                                    : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <ChevronRight className="h-5 w-5 text-slate-400 ml-auto" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedContact && (
                <ContactSlideover
                    contact={selectedContact}
                    onClose={() => setSelectedContact(null)}
                />
            )}
        </div>
    )
}
