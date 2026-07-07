import { useEvents } from '../../features/events/hooks/useEvent'
import { EventSelector } from '../../features/events/components/EventSelector'
import { LoadingSkeleton, EmptyState } from '../../components/ui'
import { Link } from 'react-router-dom'

export default function EventListPage() {
  const { data: events, isLoading } = useEvents()

  if (isLoading) return <LoadingSkeleton lines={5} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Acara</h1>
        <EventSelector />
      </div>

      {!events || events.length === 0 ? (
        <EmptyState title="Belum ada acara" description="Acara Juruladen akan muncul di sini." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">{event.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {event.task_progress && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${event.task_progress.percentage}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{event.task_progress.percentage}%</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
