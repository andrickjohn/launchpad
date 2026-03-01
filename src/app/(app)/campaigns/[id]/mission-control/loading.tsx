export default function MissionControlLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />

      {/* Title */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-8 w-52 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
            <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-1 animate-pulse" />
            <div className="h-7 w-10 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-1 animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
          </div>
        ))}
      </div>

      {/* Timeline + Actions layout */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Timeline sidebar */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-3 animate-pulse" />
          <div className="space-y-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="h-1 w-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex justify-between mb-4">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
