import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'

export function EventListPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)

    // Fetch Events
    const { data, isLoading } = useQuery({
        queryKey: ['events', page],
        queryFn: () => contentApi.getEvents({ page })
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: contentApi.deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
        }
    })

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus acara ini?')) {
            deleteMutation.mutate(id)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Memuat data acara...</div>
    }

    const events = data?.data || [] // Accessing paginated data

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#181112]">Manajemen Acara</h1>
                    <p className="text-gray-500 text-sm">Kelola jadwal acara keluarga</p>
                </div>
                <Link
                    to="/events/create"
                    className="px-4 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Acara
                </Link>
            </div>

            <div className="bg-white border border-[#e6dbdc] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fcf8f8] text-[#181112] font-semibold border-b border-[#e6dbdc]">
                        <tr>
                            <th className="px-6 py-4">Nama Acara</th>
                            <th className="px-6 py-4">Tipe</th>
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Lokasi</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6dbdc]">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Belum ada acara yang ditambahkan.
                                </td>
                            </tr>
                        ) : (
                            events.map((event: any) => (
                                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#181112]">
                                        {event.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 capitalize">
                                        {event.type.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {formatDate(event.start_date)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">
                                        {event.location_name || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${event.is_active
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {event.is_active ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/events/${event.id}/edit`}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                title="Hapus"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Pagination */}
            <div className="flex items-center justify-between pt-4">
                <div>
                    {/* Showing 1 to 10 of 20 - can be added using meta data */}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!data?.links?.next} // Assuming Laravel Paginator response
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
