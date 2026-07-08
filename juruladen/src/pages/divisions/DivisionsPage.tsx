import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEvents } from '../../features/events/hooks/useEvent'
import { useDivisions, useCreateDivision, useDeleteDivision } from '../../features/divisions/hooks/useDivisions'
import { DivisionList } from '../../features/divisions/components/DivisionList'
import { LoadingSkeleton, EmptyState, ConfirmationModal } from '../../components/ui'
import { EventSelector } from '../../features/events/components/EventSelector'

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function DivisionsPage() {
  const { eventSlug } = useParams()
  const { data: events } = useEvents()
  const event = events?.find(e => e.slug === eventSlug) || events?.[0]

  const { data: divisions, isLoading } = useDivisions(event?.id ?? null)
  const createDivision = useCreateDivision(event?.id ?? 0)
  const deleteDivision = useDeleteDivision(event?.id ?? 0)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(DEFAULT_COLORS[0])
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await createDivision.mutateAsync({ name: name.trim(), color, description })
    setName('')
    setDescription('')
    setShowForm(false)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDivision.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  if (isLoading) return <LoadingSkeleton lines={5} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Divisi</h1>
        <div className="flex items-center gap-3">
          <EventSelector />
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            + Tambah Divisi
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Tambah Divisi Baru</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama divisi"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            autoFocus
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi (opsional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            {DEFAULT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      )}

      {!divisions || divisions.length === 0 ? (
        <EmptyState
          title="Belum ada divisi"
          description="Buat divisi pertama untuk memulai manajemen tugas."
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
              + Tambah Divisi
            </button>
          }
        />
      ) : (
        <DivisionList divisions={divisions} eventId={event?.id ?? 0} onDelete={setDeleteId} />
      )}

      <ConfirmationModal
        open={!!deleteId}
        title="Hapus Divisi"
        message="Semua tugas dan anggota dalam divisi ini akan ikut terhapus. Lanjutkan?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Hapus"
        danger
      />
    </div>
  )
}
