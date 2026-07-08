import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
  custom_class?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  viewMode?: "Quarter Day" | "Half Day" | "Day" | "Week" | "Month";
  onClick?: (task: GanttTask) => void;
}

export function GanttChart({
  tasks,
  viewMode = "Day",
  onClick,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<Gantt | null>(null);

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return;

    // Destroy previous instance
    if (ganttRef.current) {
      // Gantt doesn't have a destroy method, clear the container
      containerRef.current.innerHTML = "";
    }

    ganttRef.current = new Gantt(containerRef.current, tasks, {
      view_mode: viewMode,
      date_format: "YYYY-MM-DD",
      bar_height: 28,
      bar_corner_radius: 4,
      arrow_curve: 3,
      padding: 16,
      language: "id",
      on_click: (task: any) => {
        onClick?.(task);
      },
      custom_popup_html: (task: any) => {
        return `
          <div class="p-2 text-sm">
            <p class="font-semibold text-gray-900">${task.name}</p>
            <p class="text-gray-500 text-xs mt-1">${task.start} → ${task.end}</p>
            <p class="text-gray-500 text-xs">Progress: ${task.progress}%</p>
            <p class="text-gray-400 text-xs mt-1 italic">Klik untuk detail</p>
          </div>
        `;
      },
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [tasks, viewMode]);

  return (
    <div className="frappe-gantt-wrapper">
      <style>{`
        .gantt .bar-label { font-size: 11px; }
        .gantt .bar-progress { fill: rgba(0,0,0,0.15); }
        .gantt .grid-header { font-size: 11px; }
        .gantt .grid-row { font-size: 12px; }
        .gantt .lower-text, .gantt .upper-text { font-size: 10px; }
      `}</style>
      <div ref={containerRef} className="gantt-container" />
    </div>
  );
}
