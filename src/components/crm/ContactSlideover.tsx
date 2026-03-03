'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Mail, Linkedin, Globe, Phone, Building2, Tag } from 'lucide-react'
import { CRMContact, ContactTimelineEvent, getContactTimeline } from '@/lib/db/crm'
import ContactTimeline from './ContactTimeline'

interface SlideoverProps {
    contact: CRMContact
    onClose: () => void
}

export default function ContactSlideover({ contact, onClose }: SlideoverProps) {
    const [open, setOpen] = useState(true)
    const [events, setEvents] = useState<ContactTimelineEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadTimeline() {
            try {
                const data = await getContactTimeline(contact.id)
                setEvents(data)
            } catch (err) {
                console.error('Failed to load timeline', err)
            } finally {
                setLoading(false)
            }
        }

        if (open) {
            loadTimeline()
        }
    }, [contact.id, open])

    const handleClose = () => {
        setOpen(false)
        setTimeout(onClose, 300) // matches transition duration
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-800">
                                        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-6 sm:px-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-xl font-bold leading-6 text-slate-900 dark:text-white">
                                                    Contact Profile
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none transition-colors p-1"
                                                        onClick={handleClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Identity Section */}
                                            <div className="mt-6 flex items-center gap-5">
                                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                                                    {contact.name ? contact.name.charAt(0).toUpperCase() : contact.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        {contact.name || 'Unknown Prospect'}
                                                        <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize border
                              ${contact.status === 'new' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : ''}
                              ${contact.status === 'contacted' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : ''}
                              ${contact.status === 'responded' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' : ''}
                              ${contact.status === 'converted' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : ''}
                            `}>
                                                            {contact.status}
                                                        </span>
                                                    </h2>
                                                    {contact.title && contact.company && (
                                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                                            <Building2 className="h-4 w-4" />
                                                            {contact.title} at {contact.company}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative flex-1 px-4 py-6 sm:px-6">
                                            <div className="grid grid-cols-3 gap-8 h-full">
                                                {/* Left Column: Fixed details */}
                                                <div className="col-span-1 space-y-6">
                                                    <div>
                                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                                            Contact Info
                                                        </h3>
                                                        <ul className="space-y-4">
                                                            <li className="flex items-start gap-3">
                                                                <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                                                <div className="text-sm">
                                                                    <a href={`mailto:${contact.email}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium break-all">
                                                                        {contact.email}
                                                                    </a>
                                                                </div>
                                                            </li>
                                                            {contact.linkedin_url && (
                                                                <li className="flex items-start gap-3">
                                                                    <Linkedin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                                                    <div className="text-sm">
                                                                        <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:underline inline-block truncate max-w-full">
                                                                            LinkedIn Profile
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            )}
                                                            {contact.phone && (
                                                                <li className="flex items-start gap-3">
                                                                    <Phone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                                        {contact.phone}
                                                                    </div>
                                                                </li>
                                                            )}
                                                            {contact.website && (
                                                                <li className="flex items-start gap-3">
                                                                    <Globe className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                                                    <div className="text-sm">
                                                                        <a href={contact.website} target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 hover:underline truncate inline-block max-w-full">
                                                                            {new URL(contact.website.startsWith('http') ? contact.website : `https://${contact.website}`).hostname}
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>

                                                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                                            Campaign Context
                                                        </h3>
                                                        <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                            <Tag className="h-4 w-4 text-slate-400" />
                                                            {contact.campaign?.name || 'Unassigned'}
                                                        </div>
                                                        {contact.score !== null && (
                                                            <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-md px-3 py-2 border border-slate-200 dark:border-slate-700">
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">Match Score</span>
                                                                <span className="font-bold text-primary-600 dark:text-primary-400">{contact.score}/100</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                                            Notes
                                                        </h3>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 italic bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md border border-amber-200 dark:border-amber-900/30 whitespace-pre-wrap">
                                                            {contact.notes || "No notes yet for this contact."}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column: Timeline / History */}
                                                <div className="col-span-2 border-l border-slate-200 dark:border-slate-800 pl-8 h-full">
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
                                                        Activity Timeline
                                                        <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                            {events.length} events
                                                        </span>
                                                    </h3>

                                                    {loading ? (
                                                        <div className="space-y-4 animate-pulse">
                                                            {[1, 2, 3].map(i => (
                                                                <div key={i} className="flex gap-4">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                                                                    <div className="flex-1 space-y-2 py-1">
                                                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                                                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <ContactTimeline events={events} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
