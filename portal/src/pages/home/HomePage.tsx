import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useBranches } from '../../features/silsilah'
import { contentApi } from '../../features/content/api/contentApi'
import { silsilahApi } from '../../features/silsilah/api/silsilahApi'
import { useDebounce } from '../../hooks/useDebounce'
import type { Person } from '../../features/silsilah/types'

export function HomePage() {
    const navigate = useNavigate()
    const { data } = useBranches()
    const stats = data?.stats

    const { data: homeData } = useQuery({
        queryKey: ['portal', 'home'],
        queryFn: contentApi.getHomeData
    })

    // Mobile Search State
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Person[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const debouncedQuery = useDebounce(searchQuery, 400)

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const results = await silsilahApi.search(debouncedQuery)
                setSearchResults(results)
                setShowResults(true)
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsSearching(false)
            }
        }

        performSearch()
    }, [debouncedQuery])

    const handleSelectPerson = (person: Person) => {
        setSearchQuery('')
        setShowResults(false)
        navigate(`/silsilah/branch/${person.branch_id}?focus=${person.id}`)
    }

    return (
        <MobileLayout>
            <div className="flex-1">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-[#181112] via-[#2d1f20] to-[#181112] text-white overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-[#ec1325] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ec1325] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-24">
                        <div className="max-w-3xl flex flex-col items-center text-center md:items-start md:text-left">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                                Bani Abdul Manan
                                <span className="block text-[#ec1325]">Family Portal</span>
                            </h1>
                            <p className="text-base md:text-xl text-white/70 mb-6 md:mb-8 max-w-2xl">
                                Jelajahi silsilah keluarga, ikuti acara, dan akses arsip bersejarah keluarga besar Bani Abdul Manan.
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                                <Link
                                    to="/silsilah"
                                    className="px-5 py-2.5 md:px-6 md:py-3 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">account_tree</span>
                                    Lihat Silsilah
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden px-4 -mt-5 relative z-30">
                    <div className="bg-white rounded-xl shadow-lg border border-[#e6dbdc] p-3">
                        <div className="flex items-center gap-2 h-8">
                            <span className="material-symbols-outlined text-[#896165] text-xl">search</span>
                            <input
                                type="text"
                                placeholder="Cari anggota keluarga..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowResults(true)}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[#181112] placeholder:text-[#896165] text-sm focus:outline-none h-6 leading-6"
                            />
                            {isSearching && (
                                <span className="block size-4 border-2 border-[#ec1325]/30 border-t-[#ec1325] rounded-full animate-spin" />
                            )}
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setShowResults(false) }}
                                    className="text-[#896165] hover:text-[#181112]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Results - Absolute positioned dropdown */}
                    {showResults && (searchResults.length > 0 || debouncedQuery.length >= 2) && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#e6dbdc] max-h-60 overflow-y-auto z-50">
                            {searchResults.length > 0 ? (
                                searchResults.map((person) => (
                                    <button
                                        key={person.id}
                                        className="flex items-center gap-3 p-3 hover:bg-[#f8f6f6] transition-colors text-left w-full border-b border-[#f4f0f0] last:border-b-0"
                                        onClick={() => handleSelectPerson(person)}
                                    >
                                        <div
                                            className={`size-8 rounded-full bg-cover bg-center shrink-0 flex items-center justify-center ${person.gender === 'male' ? 'bg-blue-50' : 'bg-pink-50'
                                                }`}
                                        >
                                            {person.photo_url ? (
                                                <img src={person.photo_url} alt={person.full_name} className="size-8 rounded-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {person.full_name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-[#181112] truncate">
                                                {person.full_name}
                                            </span>
                                            {person.branch && (
                                                <span className="text-[10px] text-[#896165] truncate">
                                                    Qobilah {person.branch.name.replace('Qobilah ', '')}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                !isSearching && debouncedQuery.length >= 2 && (
                                    <div className="p-3 text-center text-xs text-[#896165]">
                                        Tidak ditemukan
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="max-w-7xl mx-auto px-4 md:px-10 mt-6 md:-mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-12">
                    {/* 1. Stats Section (Full Width, Order 1) */}
                    {stats && (
                        <div className="lg:col-span-3 order-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                <div className="bg-white rounded-xl p-4 md:p-5 border border-[#e6dbdc] shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-[#ec1325]/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#ec1325]">group</span>
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-[#181112]">{stats.total_persons}</p>
                                            <p className="text-xs text-[#896165]">Total Anggota</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 md:p-5 border border-[#e6dbdc] shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-green-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-600">favorite</span>
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-[#181112]">{stats.total_living}</p>
                                            <p className="text-xs text-[#896165]">Masih Hidup</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 md:p-5 border border-[#e6dbdc] shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-blue-600">account_tree</span>
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-[#181112]">{(data?.branches || []).filter(b => b.order <= 10).length}</p>
                                            <p className="text-xs text-[#896165]">Qobilah</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 md:p-5 border border-[#e6dbdc] shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-purple-600">diversity_3</span>
                                        </div>
                                        <div>
                                            <p className="text-xl md:text-2xl font-bold text-[#181112]">{stats.total_descendants}</p>
                                            <p className="text-xs text-[#896165]">Keturunan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Events Column (Mobile: 2nd, Desktop: 4th/Right) */}
                    <div className="order-2 lg:order-4 lg:col-span-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-[#181112]">Acara Terdekat</h2>
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

                    {/* 3. Quick Access (Mobile: 3rd, Desktop: 2nd/Full Width) */}
                    <div className="order-3 lg:order-2 lg:col-span-3">
                        <h2 className="text-lg font-bold text-[#181112] mb-4">Akses Cepat</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <Link
                                to="/events"
                                className="bg-white border border-[#e6dbdc] rounded-xl p-4 hover:shadow-md hover:border-[#ec1325]/30 transition-all group"
                            >
                                <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-500 transition-colors">
                                    <span className="material-symbols-outlined text-emerald-500 group-hover:text-white transition-colors">event</span>
                                </div>
                                <h3 className="font-bold text-[#181112] text-sm group-hover:text-[#ec1325] transition-colors">Acara</h3>
                                <p className="text-xs text-[#896165] mt-1">Jadwal kegiatan</p>
                            </Link>

                            <Link
                                to="/archives"
                                className="bg-white border border-[#e6dbdc] rounded-xl p-4 hover:shadow-md hover:border-[#ec1325]/30 transition-all group"
                            >
                                <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                                    <span className="material-symbols-outlined text-blue-500 group-hover:text-white transition-colors">inventory_2</span>
                                </div>
                                <h3 className="font-bold text-[#181112] text-sm group-hover:text-[#ec1325] transition-colors">Arsip Keluarga</h3>
                                <p className="text-xs text-[#896165] mt-1">Foto, dokumen, video</p>
                            </Link>

                            <Link
                                to="/submissions"
                                className="bg-white border border-[#e6dbdc] rounded-xl p-4 hover:shadow-md hover:border-[#ec1325]/30 transition-all group"
                            >
                                <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-orange-500 transition-colors">
                                    <span className="material-symbols-outlined text-orange-500 group-hover:text-white transition-colors">edit_document</span>
                                </div>
                                <h3 className="font-bold text-[#181112] text-sm group-hover:text-[#ec1325] transition-colors">Lapor Data</h3>
                                <p className="text-xs text-[#896165] mt-1">Kirim laporan data</p>
                            </Link>

                            {/* Majmu' Card */}
                            <a
                                href="https://majmu.bamseribuputu.my.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border border-[#e6dbdc] rounded-xl p-4 hover:shadow-md hover:border-[#ec1325]/30 transition-all group"
                            >
                                <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-500 transition-colors">
                                    <span className="material-symbols-outlined text-amber-500 group-hover:text-white transition-colors">auto_stories</span>
                                </div>
                                <h3 className="font-bold text-[#181112] text-sm group-hover:text-[#ec1325] transition-colors">Majmu'</h3>
                                <p className="text-xs text-[#896165] mt-1">Bacaan amalan mbah-mbah</p>
                            </a>

                            {/* Store Card */}
                            <a
                                href="https://store.bamseribuputu.my.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border border-[#e6dbdc] rounded-xl p-4 hover:shadow-md hover:border-[#ec1325]/30 transition-all group"
                            >
                                <div className="size-10 rounded-lg bg-pink-50 flex items-center justify-center mb-3 group-hover:bg-pink-500 transition-colors">
                                    <span className="material-symbols-outlined text-pink-500 group-hover:text-white transition-colors">storefront</span>
                                </div>
                                <h3 className="font-bold text-[#181112] text-sm group-hover:text-[#ec1325] transition-colors">Store</h3>
                                <p className="text-xs text-[#896165] mt-1">Merchandise keluarga BAM</p>
                            </a>
                        </div>
                    </div>

                    {/* 4. News Section (Mobile: 4th, Desktop: 3rd/Left) */}
                    <div className="order-4 lg:order-3 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-[#181112]">Berita Terkini</h2>
                            <Link to="/news" className="text-sm text-[#ec1325] font-medium cursor-pointer hover:underline">Lihat Semua</Link>
                        </div>

                        <div className="space-y-4">
                            {(homeData?.news || []).length > 0 ? (
                                homeData?.news.map((news: any) => (
                                    <Link
                                        to={`/news/${news.id}`}
                                        key={news.id}
                                        className="block bg-white border border-[#e6dbdc] rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-center gap-3 text-xs text-[#896165] mb-2">
                                            <span className={`px-2 py-0.5 rounded capitalize ${news.category === 'lelayu' ? 'bg-black text-white' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {news.category}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(news.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-[#181112] mb-2 line-clamp-2 group-hover:text-[#ec1325] transition-colors">
                                            {news.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-3 text-sm text-[#896165]">
                                            <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                            <span>{news.author?.name || 'Admin'}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                                    Belum ada berita terbaru.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - hidden on mobile */}
                <footer className="hidden md:block bg-[#181112] text-white py-8">
                    <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
                        <p className="text-white/50 text-sm">
                            © {new Date().getFullYear()} Bani Abdul Manan Family Portal
                        </p>
                    </div>
                </footer>
            </div>
        </MobileLayout>
    )
}
