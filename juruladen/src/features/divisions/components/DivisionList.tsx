import { DivisionCard } from './DivisionCard'

interface DivisionListProps {
  divisions: import('../../../types').Division[]
  eventId: number
  onDelete: (id: number) => void
}

export function DivisionList({ divisions, eventId, onDelete }: DivisionListProps) {
  if (divisions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Belum ada divisi. Klik "Tambah Divisi" untuk memulai.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {divisions.map(div => (
        <DivisionCard key={div.id} division={div} eventId={eventId} onDelete={onDelete} />
      ))}
    </div>
  )
}
