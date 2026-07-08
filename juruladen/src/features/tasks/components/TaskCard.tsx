import { StatusBadge } from "../../../components/ui";
import { Flame, User, Calendar, AlertTriangle, X } from "lucide-react";
import type { CommitteeTask } from "../../../types";

const PRIORITY_COLORS: Record<string, string> = {
  low: "border-l-gray-400",
  medium: "border-l-blue-400",
  high: "border-l-orange-400",
  urgent: "border-l-red-500",
};

interface TaskCardProps {
  task: CommitteeTask;
  onEdit: (task: CommitteeTask) => void;
  onDelete: (taskId: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "done";

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 p-3 cursor-pointer hover:shadow-sm transition-shadow ${PRIORITY_COLORS[task.priority]}`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-900 flex-1">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="text-gray-400 hover:text-red-500 text-xs flex-shrink-0"
        >
          <X size={13} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <StatusBadge status={task.status} />
        {task.priority === "urgent" && (
          <span className="text-xs text-red-600 font-medium flex items-center gap-0.5">
            <Flame size={12} /> Urgent
          </span>
        )}
      </div>

      {task.assignee && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <User size={11} /> {task.assignee.full_name}
        </div>
      )}

      {task.deadline && (
        <div
          className={`mt-1 text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : "text-gray-400"}`}
        >
          <Calendar size={11} />{" "}
          {new Date(task.deadline).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}
          {isOverdue && <AlertTriangle size={11} />}
        </div>
      )}
    </div>
  );
}
