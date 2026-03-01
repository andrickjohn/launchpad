export default function CampaignDetailLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

      {/* Title + description + status */}
      <div className="space-y-3">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
      </div>

      {/* Campaign details card */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              {/* Label */}
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              {/* Value */}
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Launch brief section */}
      <div className="space-y-4">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              {/* Rank circle */}
              <div className="h-8 w-8 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                {/* Channel title */}
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                {/* Description */}
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                {/* Stat lines */}
                <div className="flex gap-4 pt-1">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action plan section */}
      <div className="space-y-4">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            {/* Day label */}
            <div className="h-4 w-12 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              {i % 2 === 0 && (
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
