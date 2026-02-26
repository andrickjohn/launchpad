'use client'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'title' | 'card' | 'avatar' | 'button'
  count?: number
}

export default function LoadingSkeleton({
  className = '',
  variant = 'text',
  count = 1
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] rounded"

  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    card: 'h-32 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
  }

  const skeletonClass = `${baseClasses} ${variants[variant]} ${className}`

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={skeletonClass} style={{
          animation: `shimmer 2s infinite ${i * 0.1}s`
        }} />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  )
}

// Preset loading components
export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <LoadingSkeleton variant="title" />
      <LoadingSkeleton variant="text" count={3} className="space-y-2" />
      <LoadingSkeleton variant="button" />
    </div>
  )
}

export function LoadingTable() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <LoadingSkeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="text" className="w-1/3" />
              <LoadingSkeleton variant="text" className="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LoadingDashboard() {
  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LoadingCard />
        </div>
        <div>
          <LoadingCard />
        </div>
      </div>
    </div>
  )
}
