'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Play, Target, Users, Loader2, ArrowRight, DollarSign } from 'lucide-react'
import type { ScrapeSuggestion } from '@/app/api/lists/suggest-scrapes/route'
import { SUPPORTED_SCRAPERS } from '@/lib/apify/scrapers'
import { useToast } from '@/components/ui/Toast'
import Toast from '@/components/ui/Toast'

export default function SmartListBuilder() {
    const router = useRouter()
    const { toasts, removeToast, success, error: toastError } = useToast()

    const [step, setStep] = useState<1 | 2 | 3>(1)

    // Step 1 State
    const [targetAudience, setTargetAudience] = useState('')
    const [targetCount, setTargetCount] = useState(100)

    // Step 2 State
    const [isGenerating, setIsGenerating] = useState(false)
    const [suggestions, setSuggestions] = useState<ScrapeSuggestion[]>([])
    const [selectedSuggestion, setSelectedSuggestion] = useState<ScrapeSuggestion | null>(null)
    const [isFetchingAlternative, setIsFetchingAlternative] = useState<string | null>(null)

    // Step 3 State
    const [listName, setListName] = useState('')
    const [listDescription, setListDescription] = useState('')
    const [isRunning, setIsRunning] = useState(false)

    const handleGenerateSprapes = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!targetAudience) return

        setIsGenerating(true)
        try {
            const res = await fetch('/api/lists/suggest-scrapes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetAudience, targetCount })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to generate suggestions')

            setSuggestions(data.suggestions)
            if (data.suggestions.length > 0) {
                setSelectedSuggestion(data.suggestions[0])
            }
            setStep(2)
            // Auto-fill list names based on the audience as a convenience
            setListName(`${targetAudience} List`)
            setListDescription(`Generated from query: ${targetAudience}`)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error communicating with AI'
            toastError(errorMessage)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleFetchAlternative = async (actorId: string) => {
        setIsFetchingAlternative(actorId)
        try {
            const res = await fetch('/api/lists/suggest-alternative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetAudience, targetCount, actorId })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to generate alternative')

            // Push the newly generated alternative into the suggestions pool
            // If one existed for this actor, overwrite it
            setSuggestions(prev => [
                ...prev.filter(s => s.actorId !== actorId),
                data.suggestion
            ])
            setSelectedSuggestion(data.suggestion)
            success(`Alternative config generated for ${data.suggestion.name}!`)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error generating alternative'
            toastError(errorMessage)
        } finally {
            setIsFetchingAlternative(null)
        }
    }

    const handleRunScrape = async () => {
        if (!selectedSuggestion || !listName) return

        setIsRunning(true)
        try {
            const res = await fetch('/api/lists/run-scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listName,
                    description: listDescription,
                    actorId: selectedSuggestion.actorId,
                    runInput: selectedSuggestion.runInput,
                    targetCount,
                    costUsd: selectedSuggestion.estimatedCostPer1k * (targetCount / 1000)
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to start scrape job')

            success(data.isMock ? 'Mock Scrape job successfully queued!' : 'Apify Job Started Successfully!')
            setStep(1) // Reset UI
            router.refresh() // Refresh the page to show the new Queue item
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error starting scrape'
            toastError(errorMessage)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm relative">
            {/* Toasts */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                    <h2 className="text-xl font-bold">Smart List Builder</h2>
                </div>
                <p className="text-purple-100 max-w-2xl">
                    Describe who you want to reach. Our AI will automatically configure the best web scrapers and data providers to build your targeted list.
                </p>
            </div>

            <div className="p-6">
                {step === 1 && (
                    <form onSubmit={handleGenerateSprapes} className="space-y-6 max-w-2xl">
                        <div>
                            <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Who do you want to target?
                            </label>
                            <textarea
                                id="targetAudience"
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                placeholder="e.g. Dentists and Orthodontists operating in Chicago, IL"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label htmlFor="targetCount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Target Quantity
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Users className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="number"
                                        id="targetCount"
                                        value={targetCount}
                                        onChange={(e) => setTargetCount(parseInt(e.target.value) || 100)}
                                        min="10"
                                        max="10000"
                                        step="50"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isGenerating || !targetAudience}
                            className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generating Scraper Configs...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Recommend Scrapers
                                </>
                            )}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Target className="h-5 w-5 text-purple-600" />
                                Recommended Scrape Configs
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2 mb-8">
                                {suggestions.map((suggestion, idx) => (
                                    <div
                                        key={`rec-${idx}`}
                                        onClick={() => setSelectedSuggestion(suggestion)}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedSuggestion?.actorId === suggestion.actorId
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                                            }`}
                                    >
                                        <div className="absolute -top-3 right-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-bold border border-purple-200 dark:border-purple-800">
                                            AI Recommended
                                        </div>
                                        <div className="flex justify-between items-start mb-2 mt-1">
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{suggestion.name}</h4>
                                            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium text-sm bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                {suggestion.estimatedCostPer1k.toFixed(2)}/1k
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{suggestion.description}</p>
                                        <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded text-xs font-mono text-slate-700 dark:text-slate-300 overflow-hidden break-all">
                                            ID: {suggestion.actorId}<br />
                                            {JSON.stringify(suggestion.runInput, null, 2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-4">
                                Alternative Extraction Channels
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2 opacity-80">
                                {SUPPORTED_SCRAPERS.filter(s => !suggestions.some(rec => rec.actorId === s.actorId)).map(scraper => (
                                    <div key={scraper.actorId} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-slate-700 dark:text-slate-300">{scraper.name}</h4>
                                            <span className="text-emerald-600/70 dark:text-emerald-400/70 font-medium text-xs bg-emerald-50/50 dark:bg-emerald-900/10 px-2 py-1 rounded">
                                                ${scraper.baseCostPer1k.toFixed(2)}/1k
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-500 mb-4 line-clamp-2">{scraper.description}</p>

                                        <button
                                            onClick={() => handleFetchAlternative(scraper.actorId)}
                                            disabled={isFetchingAlternative === scraper.actorId}
                                            className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:border-purple-300 dark:hover:text-purple-400 dark:hover:border-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isFetchingAlternative === scraper.actorId ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                                            ) : (
                                                <><Sparkles className="h-4 w-4" /> Ask AI to Configure Alternative</>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                Back to Criteria
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!selectedSuggestion}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                            >
                                Continue with Selection
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && selectedSuggestion && (
                    <div className="space-y-6 max-w-2xl">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Finalize & Run Job
                        </h3>

                        <div className="grid gap-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Save List As:
                                </label>
                                <input
                                    type="text"
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="My New Prospect List"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase font-semibold tracking-wider">Estimated Yield</span>
                                    <span className="text-lg font-medium text-slate-900 dark:text-white">{targetCount} contacts</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase font-semibold tracking-wider">Estimated Apify Cost</span>
                                    <span className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
                                        ${(selectedSuggestion.estimatedCostPer1k * (targetCount / 1000)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                Back to Selection
                            </button>
                            <button
                                onClick={handleRunScrape}
                                disabled={isRunning || !listName}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isRunning ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Starting Job...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5 fill-current" />
                                        Approve & Run Scrape
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
