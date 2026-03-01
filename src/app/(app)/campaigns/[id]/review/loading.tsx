export default function ReviewLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />

      {/* Title */}
      <div className="space-y-2 mb-6">
        <div className="h-8 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Progress bar card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex justify-between mb-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        <div className="flex gap-3 mt-4">
          <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Day groups */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-4">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="flex-1" />
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          </div>
          {i === 0 && (
            <div className="px-4 pb-4 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
