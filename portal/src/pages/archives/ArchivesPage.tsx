import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { contentApi } from '../../features/content/api/contentApi'
import type { MediaItem } from '../../features/content/api/contentApi'

export function ArchivesPage() {
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

    const { data: archives, isLoading } = useQuery({
        queryKey: ['portal', 'archives'],
        queryFn: () => contentApi.getArchives().then(res => res.data)
    })

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            <PortalHeader />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#181112] mb-2 tracking-tight">
                        Arsip Keluarga
                    </h1>
                    <p className="text-[#896165] max-w-2xl">
                        Koleksi dokumen, foto, video, dan rekaman bersejarah keluarga besar Bani Abdul Manan.
                    </p>
                </div>

                {/* Archives Grid */}
                <div className="mb-8">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">Memuat arsip...</div>
                    ) : (archives || []).length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {archives?.map((item: any) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedMedia(item)}
                                    className="group relative bg-white border border-[#e6dbdc] rounded-xl overflow-hidden cursor-pointer aspect-square hover:shadow-lg transition-all"
                                >
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <span className="material-symbols-outlined text-4xl text-[#ec1325]">play_circle</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={item.file_url}
                                            alt={item.caption}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Image'
                                            }}
                                        />
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <p className="text-white text-sm font-medium line-clamp-2">{item.caption || 'Tanpa Keterangan'}</p>
                                        <span className="text-white/70 text-xs mt-1">{item.year || '-'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-[#e6dbdc]">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">perm_media</span>
                            <p className="text-gray-500">Belum ada arsip yang ditampilkan.</p>
                        </div>
                    )}
                </div>

                {/* Lightbox Modal */}
                {selectedMedia && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
                        <div className="relative max-w-5xl max-h-screen w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="absolute -top-12 right-0 text-white hover:text-[#ec1325] transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>

                            {selectedMedia.type === 'video' ? (
                                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                                    {selectedMedia.file_url.includes('youtube') ? (
                                        <iframe
                                            src={selectedMedia.file_url.replace('watch?v=', 'embed/')}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video src={selectedMedia.file_url} controls className="w-full h-full" />
                                    )}
                                </div>
                            ) : (
                                <img
                                    src={selectedMedia.file_url}
                                    alt={selectedMedia.caption}
                                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                                />
                            )}

                            <div className="mt-4 text-center text-white">
                                <p className="font-medium text-lg">{selectedMedia.caption}</p>
                                <p className="text-white/60 text-sm">{selectedMedia.year}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Coming Soon Notice */}
                <div className="mt-8 bg-gradient-to-r from-[#ec1325]/5 to-transparent border border-[#ec1325]/10 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-full bg-[#ec1325]/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#ec1325]">construction</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#181112] mb-1">Fitur Dalam Pengembangan</h3>
                            <p className="text-sm text-[#896165]">
                                Halaman ini masih dalam tahap pengembangan. Nantinya akan tersedia fitur upload arsip,
                                pencarian, dan akses ke dokumen digital lengkap.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contribute CTA */}
                <div className="mt-6 bg-white border border-[#e6dbdc] rounded-xl p-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div className="size-16 rounded-full bg-[#f8f6f6] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-[#ec1325]">upload</span>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h3 className="font-bold text-[#181112] mb-1">Punya Arsip Keluarga?</h3>
                            <p className="text-sm text-[#896165]">
                                Jika Anda memiliki foto, dokumen, atau rekaman bersejarah keluarga, silakan hubungi admin untuk menambahkan ke koleksi arsip.
                            </p>
                        </div>
                        <button className="px-5 py-2.5 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-700 transition-colors shrink-0">
                            Hubungi Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
