import { useParams } from "react-router-dom";
import {
  useEvents,
  useEvent,
  useEventProgress,
} from "../../features/events/hooks/useEvent";
import { LoadingSkeleton, ProgressBar, EmptyState } from "../../components/ui";
import { Link } from "react-router-dom";

export default function EventDetailPage() {
  const { eventSlug } = useParams();
  const { data: events } = useEvents();
  const event = events?.find((e) => e.slug === eventSlug);
  const { data: detail, isLoading } = useEvent(event?.id ?? null);
  const { data: progress } = useEventProgress(event?.id ?? null);

  if (isLoading || !detail) return <LoadingSkeleton lines={8} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{detail.name}</h1>
        <Link
          to="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">Tanggal</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(detail.start_date).toLocaleDateString("id-ID")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Selesai</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(detail.end_date).toLocaleDateString("id-ID")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p className="text-sm font-medium text-gray-900">
            {detail.is_juruladen_active ? "✅ Aktif" : "⏸ Nonaktif"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-sm font-medium text-gray-900">
            {detail.budget_total
              ? `Rp ${detail.budget_total.toLocaleString()}`
              : "-"}
          </p>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Progress Divisi</h2>
          {progress.divisions.length === 0 ? (
            <EmptyState
              title="Belum ada divisi"
              description="Buat divisi di halaman Divisi."
            />
          ) : (
            <div className="space-y-3">
              {progress.divisions.map((div) => (
                <Link
                  key={div.id}
                  to={`/divisions/detail/${div.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className="w-3 h-3 rounded-full"
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
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {div.task_counts.done}/{div.task_counts.total} tugas
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
