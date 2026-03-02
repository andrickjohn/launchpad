import { Calendar, Clock, Mail } from 'lucide-react'
// type Outreach not used directly in this file's imports as we define the array loosely, but keeping it clean

interface UpcomingScheduleProps {
  scheduled: Array<Record<string, unknown>> // Outreach with prospect relation
}

export default function UpcomingSchedule({ scheduled }: UpcomingScheduleProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary-600" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Upcoming Schedule
        </h2>
      </div>

      {scheduled.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-600 dark:text-slate-400">
            No scheduled outreach. Schedule emails from the Outreach tab!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {scheduled.map((item, index) => {
            const dateStr = typeof item.scheduled_at === 'string' ? item.scheduled_at : null
            const scheduledDate = dateStr ? new Date(dateStr) : null
            const prospectData = item.prospect as unknown as Record<string, unknown>
            const prospectName = prospectData?.name || prospectData?.email || 'Unknown'

            return (
              <li
                key={typeof item.id === 'string' ? item.id : index}
                className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    {(typeof item.subject === 'string' && item.subject) || 'No subject'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    To: {String(prospectName)}
                  </p>
                  {scheduledDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {scheduledDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
