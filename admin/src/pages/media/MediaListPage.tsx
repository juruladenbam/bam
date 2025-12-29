import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'

export function MediaListPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)

    // Fetch Media
    // We can add filters for type/year later
    const { data, isLoading } = useQuery({
        queryKey: ['media', page],
        queryFn: () => contentApi.getMedia({ page, per_page: 12 })
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: contentApi.deleteMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] })
        }
    })

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus media ini?')) {
            deleteMutation.mutate(id)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Memuat galeri...</div>
    }

    const mediaList = data?.data || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#181112]">Manajemen Arsip</h1>
                    <p className="text-gray-500 text-sm">Kelola foto dan video dokumentasi</p>
                </div>
                <Link
                    to="/media/upload"
                    className="px-4 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">upload</span>
                    Upload Media
                </Link>
            </div>

            {mediaList.length === 0 ? (
                <div className="bg-white border border-[#e6dbdc] rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">perm_media</span>
                    <p className="text-gray-500">Belum ada media yang diupload.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaList.map((item: any) => (
                        <div key={item.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-[#e6dbdc]">
                            {item.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <span className="material-symbols-outlined text-4xl text-gray-400">play_circle</span>
                                </div>
                            ) : (
                                <img
                                    src={item.file_url}
                                    alt={item.caption || 'Media'}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Error+Loading+Image'
                                    }}
                                />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-white text-xs truncate mb-2">{item.caption || 'Tanpa Keterangan'}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-[10px]">{item.year || '-'}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 bg-white/20 text-white rounded hover:bg-red-600 transition-colors"
                                        title="Hapus"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
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
