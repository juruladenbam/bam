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

    const { data: headlines } = useQuery({
        queryKey: ['portal', 'news', 'headlines'],
        queryFn: contentApi.getHeadlines
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

                {/* Headlines */}
                {headlines && headlines.length > 0 && (
                    <div className="mb-12 border-b border-[#e6dbdc] pb-12">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#181112]">
                            <span className="material-symbols-outlined text-[#ec1325]">breaking_news_alt_1</span>
                            Headline
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Headline */}
                            <Link
                                to={`/news/${headlines[0].id}`}
                                className="lg:col-span-2 group relative h-[350px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all block"
                            >
                                <img
                                    src={headlines[0].thumbnail || 'https://placehold.co/800x400?text=No+Image'}
                                    alt={headlines[0].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                                    <span className="inline-block px-2.5 py-1 bg-[#ec1325] text-white text-[10px] font-bold rounded mb-2 w-fit uppercase tracking-wider">
                                        {headlines[0].category}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mb-1 leading-tight group-hover:text-red-400 transition-colors">
                                        {headlines[0].title}
                                    </h3>
                                    <p className="text-white/70 text-sm">
                                        {new Date(headlines[0].published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </Link>

                            {/* Side Headlines */}
                            <div className="flex flex-col gap-4">
                                {headlines.slice(1, 4).map((news: any) => (
                                    <Link
                                        key={news.id}
                                        to={`/news/${news.id}`}
                                        className="flex gap-3 p-3 bg-white rounded-xl border border-[#e6dbdc] hover:border-[#ec1325]/30 hover:shadow-sm transition-all group"
                                    >
                                        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={news.thumbnail || 'https://placehold.co/200x200?text=No+Image'}
                                                alt={news.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-[#ec1325] uppercase tracking-wider mb-0.5">
                                                {news.category}
                                            </span>
                                            <h4 className="font-bold text-[#181112] text-sm leading-snug line-clamp-2 group-hover:text-[#ec1325] transition-colors">
                                                {news.title}
                                            </h4>
                                            <p className="text-[10px] text-[#896165] mt-1">
                                                {new Date(news.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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
