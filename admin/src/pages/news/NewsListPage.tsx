import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'

export function NewsListPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)

    // Fetch News
    const { data, isLoading } = useQuery({
        queryKey: ['news', page],
        queryFn: () => contentApi.getNews({ page })
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: contentApi.deleteNews,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] })
        }
    })

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
            deleteMutation.mutate(id)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Memuat data berita...</div>
    }

    const newsList = data?.data || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#181112]">Manajemen Berita</h1>
                    <p className="text-gray-500 text-sm">Kelola artikel dan pengumuman keluarga</p>
                </div>
                <Link
                    to="/news/create"
                    className="px-4 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Berita
                </Link>
            </div>

            <div className="bg-white border border-[#e6dbdc] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#fcf8f8] text-[#181112] font-semibold border-b border-[#e6dbdc]">
                        <tr>
                            <th className="px-6 py-4">Judul</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Penulis</th>
                            <th className="px-6 py-4">Tanggal Publikasi</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6dbdc]">
                        {newsList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Belum ada berita yang ditambahkan.
                                </td>
                            </tr>
                        ) : (
                            newsList.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#181112] max-w-xs truncate">
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 capitalize">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {item.author?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {formatDate(item.published_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.is_public
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-yellow-50 text-yellow-700'
                                            }`}>
                                            {item.is_public ? 'Publik' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/news/${item.id}/edit`}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
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
                <div></div>
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
                        disabled={!data?.links?.next}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
