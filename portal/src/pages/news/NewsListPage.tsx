import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { contentApi, type NewsItem } from '../../features/content/api/contentApi'

export function NewsListPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get('page')) || 1

    const { data, isLoading } = useQuery({
        queryKey: ['portal', 'news', page],
        queryFn: () => contentApi.getNews(page)
    })

    const newsList = (data as any)?.data as NewsItem[] || []
    const meta = (data as any)?.meta

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: String(newPage) })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            <PortalHeader />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8 md:py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#181112]">Berita Keluarga</h1>
                        <p className="text-[#896165] mt-1">Kabar terbaru dan informasi kegiatan keluarga besar</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-[#e6dbdc]"></div>
                        ))}
                    </div>
                ) : newsList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {newsList.map((news) => (
                                <Link
                                    to={`/news/${news.id}`}
                                    key={news.id}
                                    className="block bg-white border border-[#e6dbdc] rounded-xl p-5 hover:shadow-md transition-shadow group flex flex-col h-full"
                                >
                                    <div className="flex items-center gap-3 text-xs text-[#896165] mb-3">
                                        <span className={`px-2 py-0.5 rounded capitalize ${news.category === 'lelayu' ? 'bg-black text-white' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {news.category}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(news.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                    </div>

                                    {news.thumbnail && (
                                        <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
                                            <img
                                                src={news.thumbnail}
                                                alt={news.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    <h3 className="text-xl font-bold text-[#181112] mb-3 line-clamp-2 group-hover:text-[#ec1325] transition-colors">
                                        {news.title}
                                    </h3>

                                    {/* Author & Claps */}
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-[#896165]">
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                            <span className="truncate max-w-[150px]">{news.author?.name || 'Admin'}</span>
                                        </div>
                                        {news.claps !== undefined && news.claps > 0 && (
                                            <div className="flex items-center gap-1 text-xs font-medium text-[#896165]">
                                                <span className="text-[14px]">👏</span>
                                                {news.claps}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="flex justify-center mt-12 gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg disabled:opacity-50 hover:bg-gray-50 text-[#181112] font-medium"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-[#896165]">
                                    Halaman {meta.current_page} dari {meta.last_page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === meta.last_page}
                                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg disabled:opacity-50 hover:bg-gray-50 text-[#181112] font-medium"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <span className="material-symbols-outlined text-3xl">newspaper</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#181112]">Belum ada berita</h3>
                        <p className="text-[#896165]">Berita terbaru akan muncul di halaman ini.</p>
                    </div>
                )}
            </div>

            <footer className="bg-[#181112] text-white py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
                    <p className="text-white/50 text-sm">
                        © {new Date().getFullYear()} Bani Abdul Manan Family Portal
                    </p>
                </div>
            </footer>
        </div>
    )
}
