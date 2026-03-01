export default function ProspectsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Campaign section */}
      <div className="space-y-3">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3"
            >
              {/* Title */}
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              {/* Description */}
              <div className="h-3 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              {/* Badge */}
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Prospects table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_1fr_1fr_6rem_5rem_5rem] gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`grid grid-cols-[2rem_1fr_1fr_1fr_6rem_5rem_5rem] gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 ${
              i % 2 === 1 ? "bg-slate-50 dark:bg-slate-800/50" : ""
            }`}
          >
            {/* Checkbox */}
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse self-center" />
            {/* Name */}
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse self-center" />
            {/* Email */}
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse self-center" />
            {/* Company */}
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse self-center" />
            {/* Score bar */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse self-center" />
            {/* Status badge */}
            <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse self-center" />
            {/* Campaign badge */}
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
