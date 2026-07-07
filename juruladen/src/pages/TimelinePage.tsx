import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents, useEventTimeline } from "../features/events/hooks/useEvent";
import { useDivisions } from "../features/divisions/hooks/useDivisions";
import { EventSelector } from "../features/events/components/EventSelector";
import { GanttChart } from "../components/ui/GanttChart";
import { LoadingSkeleton, EmptyState } from "../components/ui";
import { useParams } from "react-router-dom";
import type { TimelineTask } from "../types";

const STATUS_PROGRESS: Record<string, number> = {
  todo: 0,
  in_progress: 50,
  done: 100,
  blocked: 25,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#9CA3AF",
  medium: "#3B82F6",
  high: "#F59E0B",
  urgent: "#EF4444",
};

export default function TimelinePage() {
  const navigate = useNavigate();
  const { eventSlug } = useParams();
  const { data: events } = useEvents();
  const event = events?.find((e) => e.slug === eventSlug) || events?.[0];
  const { data: divisions } = useDivisions(event?.id ?? null);

  const [filterDivision, setFilterDivision] = useState("");
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day");

  const { data: timeline, isLoading } = useEventTimeline(event?.id ?? null, {
    division: filterDivision || undefined,
  });

  // Convert timeline tasks to frappe-gantt format
  const ganttTasks = useMemo(() => {
    if (!timeline?.tasks) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return timeline.tasks
      .filter((t: TimelineTask) => t.deadline)
      .map((t: TimelineTask) => {
        const deadline = new Date(t.deadline!);
        deadline.setHours(23, 59, 59, 999);

        // Active tasks: bar from today to deadline (working window)
        // Done tasks: bar on deadline date only
        const start =
          t.status === "done"
            ? new Date(deadline)
            : today < deadline
              ? today
              : new Date(deadline);

        start.setHours(0, 0, 0, 0);

        return {
          id: String(t.id),
          name: `${t.priority === "urgent" ? "[!] " : ""}${t.title}`,
          start: start.toISOString().split("T")[0],
          end: deadline.toISOString().split("T")[0],
          progress: STATUS_PROGRESS[t.status] || 0,
          dependencies: "",
          custom_class: `div-${t.division.slug}`,
        };
      });
  }, [timeline]);

  // Inject custom CSS for division colors
  const divisionStyles = useMemo(() => {
    if (!divisions) return "";
    return divisions
      .map(
        (d) => `
        .gantt .bar-wrapper.div-${d.slug} .bar {
          fill: ${d.color} !important;
        }
        .gantt .bar-wrapper.div-${d.slug} .bar-progress {
          fill: ${d.color}88 !important;
        }
        .gantt .bar-wrapper.div-${d.slug} .bar-label {
          fill: #fff !important;
        }
      `,
      )
      .join("\n");
  }, [divisions]);

  const handleTaskClick = (task: any) => {
    const originalTask = timeline?.tasks.find(
      (t: TimelineTask) => String(t.id) === task.id,
    );
    if (originalTask) {
      navigate(`/divisions/detail/${originalTask.division.id}`);
    }
  };

  if (isLoading) return <LoadingSkeleton lines={6} />;

  return (
    <div className="space-y-4">
      <style>{divisionStyles}</style>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Timeline</h1>
        <EventSelector />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <select
          value={filterDivision}
          onChange={(e) => setFilterDivision(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
        >
          <option value="">Semua Divisi</option>
          {divisions?.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>

        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(["Day", "Week", "Month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode === "Day"
                ? "Harian"
                : mode === "Week"
                  ? "Mingguan"
                  : "Bulanan"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 ml-auto text-xs text-gray-500">
          {divisions?.map((d) => (
            <div key={d.slug} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.name}
            </div>
          ))}
          <div className="border-l border-gray-300 pl-4 flex items-center gap-4">
            {Object.entries(STATUS_PROGRESS).map(([status, progress]) => (
              <div key={status} className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor:
                      progress === 100
                        ? "#10B981"
                        : progress === 50
                          ? "#3B82F6"
                          : progress === 25
                            ? "#EF4444"
                            : "#9CA3AF",
                    backgroundColor:
                      progress === 100
                        ? "#10B98133"
                        : progress === 50
                          ? "#3B82F633"
                          : "transparent",
                  }}
                />
                {status === "todo"
                  ? "Todo"
                  : status === "in_progress"
                    ? "In Progress"
                    : status === "done"
                      ? "Done"
                      : "Blocked"}
              </div>
            ))}
          </div>
        </div>
      </div>

      {ganttTasks.length === 0 ? (
        <EmptyState
          title="Tidak ada tugas"
          description={
            filterDivision
              ? "Tidak ada tugas dengan deadline untuk divisi ini."
              : "Belum ada tugas dengan deadline."
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
          <GanttChart
            tasks={ganttTasks}
            viewMode={viewMode}
            onClick={handleTaskClick}
          />
        </div>
      )}
    </div>
  );
}
