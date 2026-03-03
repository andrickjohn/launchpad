import { getCRMContacts } from '@/lib/db/crm'
import { getAuthUser } from '@/lib/supabase/auth-bypass'
import { createClient } from '@/lib/supabase/server'
import { FolderOpen, Search, Filter } from 'lucide-react'
import CRMTable from '@/components/crm/CRMTable'

export default async function CRMPage() {
    const supabase = await createClient()
    const { data: { user } } = await getAuthUser(supabase)

    if (!user) return null

    // Fetch all prospects globally
    const contacts = await getCRMContacts()
    const hasContacts = contacts.length > 0

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            {/* Header */}
            <div className="mb-6 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <FolderOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Contacts CRM
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Centralized view of all prospects and activity history
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                disabled // We'll add client-side filtering in the table component
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                {hasContacts ? (
                    <CRMTable initialContacts={contacts} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <FolderOpen className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No contacts yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                            When you add prospects to a campaign or import lists, they will appear here in your central database.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
