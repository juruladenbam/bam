import { useQueryClient } from '@tanstack/react-query'
import { LoadingSkeleton } from '../../../components/ui'
import { TaskCard } from './TaskCard'
import type { CommitteeTask } from '../../../types'

const COLUMNS: { key: CommitteeTask['status']; label: string; color: string }[] = [
  { key: 'todo', label: 'Todo', color: 'bg-gray-100' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50' },
  { key: 'done', label: 'Done', color: 'bg-green-50' },
  { key: 'blocked', label: 'Blocked', color: 'bg-red-50' },
]

interface KanbanBoardProps {
  tasks: CommitteeTask[]
  isLoading: boolean
  divisionId: number
  eventId: number
  onEditTask: (task: CommitteeTask) => void
  onDeleteTask: (taskId: number) => void
  onDropTask: (taskId: number, newStatus: CommitteeTask['status']) => void
}

export function KanbanBoard({ tasks, isLoading, divisionId, eventId, onEditTask, onDeleteTask, onDropTask }: KanbanBoardProps) {
  if (isLoading) return <LoadingSkeleton lines={6} />

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key).sort((a, b) => a.sort_order - b.sort_order)
    return acc
  }, {} as Record<string, CommitteeTask[]>)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: CommitteeTask['status']) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    if (taskId) onDropTask(taskId, status)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map(col => (
        <div
          key={col.key}
          className={`${col.color} rounded-xl p-3 min-h-[200px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.key)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">{grouped[col.key]?.length || 0}</span>
          </div>
          <div className="space-y-2">
            {grouped[col.key]?.map(task => (
              <div key={task.id} draggable onDragStart={(e) => e.dataTransfer.setData('taskId', String(task.id))}>
                <TaskCard task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
