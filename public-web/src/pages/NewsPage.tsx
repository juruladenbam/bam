import { useNews, NewsCard } from '@/features/news';
import { useState } from 'react';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'

export default function NewsPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useNews(page);

    return (
        <div>
            {/* Header */}
            <section className="bg-gradient-to-br from-[#181112] to-[#3d2a2c] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Kabar Keluarga</h1>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        Berita, pengumuman, dan kabar terbaru dari keluarga besar Bani Abdul Manan.
                    </p>
                </div>
            </section>

            {/* News Grid */}
            <section className="py-16 bg-[#f8f6f6]">
                <div className="container mx-auto px-4 max-w-[1200px]">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-5xl text-[#ec1325]/30">error</span>
                            <p className="mt-4 text-[#896165]">Gagal memuat berita</p>
                        </div>
                    ) : data?.data && data.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data.data.map((news) => (
                                    <NewsCard key={news.id} news={news} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.meta && data.meta.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-12">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 rounded-lg border border-[#e6dbdc] bg-white disabled:opacity-50 hover:bg-[#f8f6f6] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    <span className="px-4 py-2 text-[#181112]">
                                        Halaman {page} dari {data.meta.last_page}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
                                        disabled={page === data.meta.last_page}
                                        className="px-4 py-2 rounded-lg border border-[#e6dbdc] bg-white disabled:opacity-50 hover:bg-[#f8f6f6] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-5xl text-[#896165]/30">newspaper</span>
                            <p className="mt-4 text-[#896165]">Belum ada berita</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-[#181112] mb-4">
                        Ingin mendapat update eksklusif?
                    </h2>
                    <p className="text-[#896165] mb-6 max-w-lg mx-auto">
                        Login ke Portal Member untuk mengakses berita khusus anggota keluarga.
                    </p>
                    <a
                        href={`${PORTAL_URL}/login`}
                        className="inline-block px-8 py-3 bg-[#ec1325] text-white font-semibold rounded-lg hover:bg-[#c91020] transition-colors"
                    >
                        Login ke Portal
                    </a>
                </div>
            </section>
        </div>
    );
}
