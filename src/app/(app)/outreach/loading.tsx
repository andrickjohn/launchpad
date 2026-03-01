export default function OutreachLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Form-like content area */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-5 max-w-3xl">
        {/* Select dropdown skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Subject input skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Message textarea skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
