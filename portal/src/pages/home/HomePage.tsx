import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { useBranches } from '../../features/silsilah'
import { contentApi } from '../../features/content/api/contentApi'

export function HomePage() {
    const { data } = useBranches()
    const stats = data?.stats

    const { data: homeData } = useQuery({
        queryKey: ['portal', 'home'],
        queryFn: contentApi.getHomeData
    })

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            <PortalHeader />

            <div className="flex-1">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-[#181112] via-[#2d1f20] to-[#181112] text-white overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-[#ec1325] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ec1325] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Bani Abdul Manan
                                <span className="block text-[#ec1325]">Family Portal</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl">
                                Jelajahi silsilah keluarga, ikuti acara, dan akses arsip bersejarah keluarga besar Bani Abdul Manan.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/silsilah"
                                    className="px-6 py-3 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">account_tree</span>
                                    Lihat Silsilah
                                </Link>
                                <Link
                                    to="/events"
                                    className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">event</span>
                                    Acara Mendatang
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                {stats && (
                    <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-8 relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-[#ec1325]/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#ec1325]">group</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#181112]">{stats.total_persons}</p>
                                        <p className="text-xs text-[#896165]">Total Anggota</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-green-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-600">favorite</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#181112]">{stats.total_living}</p>
                                        <p className="text-xs text-[#896165]">Masih Hidup</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-600">account_tree</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#181112]">{(data?.branches || []).filter(b => b.order <= 10).length}</p>
                                        <p className="text-xs text-[#896165]">Qobilah</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-600">diversity_3</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#181112]">{stats.total_descendants}</p>
                                        <p className="text-xs text-[#896165]">Keturunan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dynamic Content Section: News & Events */}
                <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* News Column (2/3) */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#181112]">Berita Terkini</h2>
                                <span className="text-sm text-[#ec1325] font-medium cursor-pointer hover:underline">Lihat Semua</span>
                            </div>

                            {/* News List */}
                            <div className="space-y-4">
                                {(homeData?.news || []).length > 0 ? (
                                    homeData?.news.map((news: any) => (
                                        <div key={news.id} className="bg-white border border-[#e6dbdc] rounded-xl p-5 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 text-xs text-[#896165] mb-2">
                                                <span className={`px-2 py-0.5 rounded capitalize ${news.category === 'lelayu' ? 'bg-black text-white' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {news.category}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(news.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-[#181112] mb-2 line-clamp-2 hover:text-[#ec1325] transition-colors cursor-pointer">
                                                {news.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-3 text-sm text-[#896165]">
                                                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                                <span>{news.author?.name || 'Admin'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                                        Belum ada berita terbaru.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Events Column (1/3) */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#181112]">Acara Terdekat</h2>
                                <Link to="/events" className="text-sm text-[#ec1325] font-medium hover:underline">Lihat Jadwal</Link>
                            </div>

                            <div className="space-y-4">
                                {(homeData?.upcoming_events || []).length > 0 ? (
                                    homeData?.upcoming_events.map((event: any) => (
                                        <div key={event.id} className="bg-white border border-[#e6dbdc] rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                                            <div className="bg-[#ec1325] px-4 py-2 text-white flex items-center justify-between">
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-xs opacity-80">
                                                        {new Date(event.start_date).toLocaleDateString('id-ID', { month: 'short' })}
                                                    </span>
                                                    <span className="text-xl font-bold">
                                                        {new Date(event.start_date).getDate()}
                                                    </span>
                                                </div>
                                                <span className="material-symbols-outlined opacity-50">event</span>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-[#181112] mb-1 group-hover:text-[#ec1325] transition-colors truncate">
                                                    {event.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-[#896165] mb-2">
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                    <span className="truncate">{event.location_name || 'Lokasi belum ditentukan'}</span>
                                                </div>
                                                <div className="flex justify-end">
                                                    <span className="text-xs text-[#ec1325] font-medium bg-red-50 px-2 py-1 rounded">
                                                        {event.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                                        Tidak ada acara dalam waktu dekat.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-10 pb-16">
                    <h2 className="text-2xl font-bold text-[#181112] mb-8 text-center">
                        Jelajahi Portal
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Silsilah */}
                        <Link
                            to="/silsilah"
                            className="group bg-white border border-[#e6dbdc] rounded-xl p-6 hover:shadow-lg hover:border-[#ec1325]/30 transition-all"
                        >
                            <div className="size-14 rounded-xl bg-[#ec1325]/10 flex items-center justify-center mb-4 group-hover:bg-[#ec1325] transition-colors">
                                <span className="material-symbols-outlined text-3xl text-[#ec1325] group-hover:text-white transition-colors">
                                    account_tree
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[#181112] mb-2 group-hover:text-[#ec1325] transition-colors">
                                Silsilah Keluarga
                            </h3>
                            <p className="text-sm text-[#896165]">
                                Visualisasi pohon keluarga interaktif dengan pencarian dan navigasi per qobilah.
                            </p>
                        </Link>

                        {/* Archives */}
                        <Link
                            to="/archives"
                            className="group bg-white border border-[#e6dbdc] rounded-xl p-6 hover:shadow-lg hover:border-[#ec1325]/30 transition-all"
                        >
                            <div className="size-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-blue-500 group-hover:text-white transition-colors">
                                    inventory_2
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[#181112] mb-2 group-hover:text-[#ec1325] transition-colors">
                                Arsip Keluarga
                            </h3>
                            <p className="text-sm text-[#896165]">
                                Koleksi foto, dokumen, video, dan rekaman bersejarah keluarga.
                            </p>
                        </Link>

                        {/* Admin/Login Link (Subtle) */}
                        <Link
                            to="/login" // Assuming login route exists or external. Wait, portal has separate login?
                            // Actually just leave it or maybe a profile link.
                            // Let's stick to simple features.
                            className="group bg-white border border-[#e6dbdc] rounded-xl p-6 hover:shadow-lg hover:border-[#ec1325]/30 transition-all"
                        >
                            <div className="size-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-gray-600 group-hover:text-white transition-colors">
                                    person
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[#181112] mb-2 group-hover:text-[#ec1325] transition-colors">
                                Profil Anggota
                            </h3>
                            <p className="text-sm text-[#896165]">
                                Kelola data diri dan keluarga Anda melalui dashboard anggota.
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-[#181112] text-white py-8">
                    <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
                        <p className="text-white/50 text-sm">
                            © {new Date().getFullYear()} Bani Abdul Manan Family Portal
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    )
}
