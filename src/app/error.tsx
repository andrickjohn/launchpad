'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App-level error caught by Next.js error boundary:', error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900/30 p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full inline-block mb-6">
                    <AlertTriangle className="h-10 w-10" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Something went wrong!
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    An unexpected error occurred in the application. Let&apos;s try to recover.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try again
                    </button>

                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}
