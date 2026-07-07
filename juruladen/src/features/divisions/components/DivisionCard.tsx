import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { ProgressBar } from "../../../components/ui";
import type { Division } from "../../../types";

interface DivisionCardProps {
  division: Division;
  eventId: number;
  onDelete: (id: number) => void;
}

export function DivisionCard({ division, onDelete }: DivisionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: division.color }}
          />
          <h3 className="font-semibold text-gray-900">{division.name}</h3>
        </div>
        <button
          onClick={() => onDelete(division.id)}
          className="text-gray-400 hover:text-red-500 p-0.5"
          title="Hapus divisi"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <ProgressBar
        value={division.progress}
        color={division.color}
        className="mb-2"
      />
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{division.progress}%</span>
        <span>
          {division.task_counts.done}/{division.task_counts.total} tugas
        </span>
      </div>
      <div className="flex gap-1 text-xs text-gray-400">
        <span>{division.members.length} anggota</span>
      </div>
      <Link
        to={`/divisions/detail/${division.id}`}
        className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1.5 bg-blue-50 rounded-lg"
      >
        Buka Kanban
      </Link>
    </div>
  );
}
