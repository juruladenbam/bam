import { useEvents, useEventProgress } from "../features/events/hooks/useEvent";
import { EventSelector } from "../features/events/components/EventSelector";
import { ProgressBar, LoadingSkeleton } from "../components/ui";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Users, Calendar, Settings, ClipboardList } from "lucide-react";

export default function DashboardPage() {
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { eventSlug } = useParams();

  // Find current event
  const currentEvent = events?.find((e) => e.slug === eventSlug) || events?.[0];
  const { data: progress, isLoading: progressLoading } = useEventProgress(
    currentEvent?.id ?? null,
  );

  const isLoading = eventsLoading || progressLoading;

  if (isLoading) return <LoadingSkeleton lines={8} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <EventSelector />
      </div>

      {!currentEvent ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Belum ada acara aktif di Juruladen.</p>
          <p className="text-sm mt-1">
            Hubungi Superadmin untuk mengaktifkan acara.
          </p>
        </div>
      ) : (
        <>
          {/* Event Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentEvent.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(currentEvent.start_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" — "}
              {new Date(currentEvent.end_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Progress Overview */}
          {progress && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                Progress Keseluruhan
              </h3>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-3xl font-bold text-blue-700">
                  {progress.overall_progress}%
                </span>
                <span className="text-sm text-gray-500 pb-0.5">
                  {progress.done_tasks}/{progress.total_tasks} tugas selesai
                </span>
              </div>
              <ProgressBar value={progress.overall_progress} className="mb-4" />

              {/* Per Division */}
              <div className="space-y-2">
                {progress.divisions.map((div) => (
                  <Link
                    key={div.id}
                    to={`/divisions/detail/${div.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: div.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 w-24">
                      {div.name}
                    </span>
                    <ProgressBar
                      value={div.progress}
                      color={div.color}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {div.progress}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/divisions"
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <Users className="mx-auto text-blue-600" size={28} />
              <p className="text-sm font-medium text-gray-700 mt-2">Divisi</p>
            </Link>
            <Link
              to="/timeline"
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <Calendar className="mx-auto text-green-600" size={28} />
              <p className="text-sm font-medium text-gray-700 mt-2">Timeline</p>
            </Link>
            <Link
              to="/users"
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <Settings className="mx-auto text-gray-600" size={28} />
              <p className="text-sm font-medium text-gray-700 mt-2">Pengguna</p>
            </Link>
            {currentEvent && (
              <Link
                to={`/events/${currentEvent.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
              >
                <ClipboardList className="mx-auto text-purple-600" size={28} />
                <p className="text-sm font-medium text-gray-700 mt-2">Detail</p>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
