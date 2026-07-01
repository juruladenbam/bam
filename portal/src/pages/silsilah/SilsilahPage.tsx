import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useBranches, useCemeteryPersons, type Branch } from '../../features/silsilah'
import { MobileLayout } from '../../components/layout/MobileLayout'

export function SilsilahPage() {
    const navigate = useNavigate()
    const { data, isLoading, error } = useBranches()
    const [selectedCemetery, setSelectedCemetery] = useState<string | null>(null)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-[#ec1325] text-4xl">
                    progress_activity
                </span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] flex flex-col items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <p>Gagal memuat data silsilah</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-red-700 transition"
                >
                    Coba Lagi
                </button>
            </div>
        )
    }

    const branches = (data?.branches || []).filter(b => b.order <= 10)
    const stats = data?.stats || {
        total_persons: 0,
        total_living: 0,
        total_descendants: 0,
        total_spouses: 0,
        total_living_descendants: 0,
        total_living_spouses: 0,
        total_kk_utuh: 0,
        total_male: 0,
        total_female: 0,
        generation_stats: [],
        burial_place_stats: []
    }

    const deadCount = stats.total_persons - stats.total_living
    const livingPercent = stats.total_persons > 0 ? Math.round((stats.total_living / stats.total_persons) * 100) : 0

    return (
        <MobileLayout>
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
                {/* Hero / Header Section */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#181112] mb-3 tracking-tight">
                        Silsilah Keluarga
                    </h1>
                    <p className="text-[#896165] max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        Jelajahi garis keturunan lengkap Bani Abdul Manan. Data ini mencakup qobilah-qobilah besar, statistik generasi, dan distribusi keluarga.
                    </p>
                </div>

                {/* Stats Overview - 4 Clean Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white rounded-2xl p-6 border border-[#e6dbdc] shadow-sm text-center md:text-left">
                        <p className="text-3xl font-bold text-[#181112] font-mono leading-none mb-2">{stats.total_persons}</p>
                        <p className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-2">Total Anggota</p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-blue-600">
                                <span className="material-symbols-outlined text-[14px]">male</span> {stats.total_male}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-pink-500">
                                <span className="material-symbols-outlined text-[14px]">female</span> {stats.total_female}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#e6dbdc] shadow-sm text-center md:text-left">
                        <p className="text-3xl font-bold text-green-600 font-mono leading-none mb-2">{stats.total_living}</p>
                        <p className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-2">Masih Hidup</p>
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${livingPercent}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{livingPercent}% dari total anggota</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#e6dbdc] shadow-sm text-center md:text-left">
                        <p className="text-3xl font-bold text-[#ec1325] font-mono leading-none mb-2">{deadCount}</p>
                        <p className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-2">Telah Wafat</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{100 - livingPercent}% dari total anggota</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#e6dbdc] shadow-sm text-center md:text-left">
                        <p className="text-3xl font-bold text-orange-600 font-mono leading-none mb-2">{stats.total_kk_utuh || 0}</p>
                        <p className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-2">Keluarga (KK)</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">KK dengan pasangan lengkap</p>
                    </div>
                </div>

                {/* Collapsible Stats Tables Section */}
                <div className="space-y-4 mb-14">
                    {/* Per Qobilah Table */}
                    <details className="group bg-white border border-[#e6dbdc] rounded-2xl overflow-hidden shadow-sm">
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#181112]">Statistik Per Qobilah</h3>
                                    <p className="text-[10px] text-[#896165]">Rincian anggota, gender, dan KK per cabang</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[#896165] transition-transform group-open:rotate-180">
                                keyboard_arrow_down
                            </span>
                        </summary>
                        <div className="p-0 border-t border-[#f4f0f0] overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#f8f6f6] text-[#896165] text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 border-b border-[#e6dbdc]">Qobilah</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">Ktrn</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">Mntu</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♂</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♀</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center text-green-600">Hidup</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center text-[#ec1325]">Wafat</th>
                                        <th className="px-5 py-3 border-b border-[#e6dbdc] text-center">KK</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f4f0f0]">
                                    {data?.branches?.filter(b => b.order <= 10).map((branch: Branch) => (
                                        <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3 font-bold text-[#181112]">
                                                {branch.name.replace('Qobilah ', '')}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono">{branch.persons_count}</td>
                                            <td className="px-4 py-3 text-center font-mono text-gray-400">{branch.spouse_count}</td>
                                            <td className="px-4 py-3 text-center font-mono text-blue-600">{branch.male_count}</td>
                                            <td className="px-4 py-3 text-center font-mono text-pink-500">{branch.female_count}</td>
                                            <td className="px-4 py-3 text-center font-mono text-green-600 font-bold">{branch.living_count}</td>
                                            <td className="px-4 py-3 text-center font-mono text-[#ec1325]">{Number(branch.persons_count) - Number(branch.living_count)}</td>
                                            <td className="px-5 py-3 text-center font-mono font-bold text-orange-600">{branch.kk_utuh_count}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-[#f8f6f6]/50 font-bold">
                                        <td className="px-5 py-4 text-[#181112]">TOTAL</td>
                                        <td className="px-4 py-4 text-center font-mono">{branches.reduce((acc, b) => acc + Number(b.persons_count || 0), 0)}</td>
                                        <td className="px-4 py-4 text-center font-mono">{branches.reduce((acc, b) => acc + Number(b.spouse_count || 0), 0)}</td>
                                        <td className="px-4 py-4 text-center font-mono text-blue-600">{stats.total_male}</td>
                                        <td className="px-4 py-4 text-center font-mono text-pink-500">{stats.total_female}</td>
                                        <td className="px-4 py-4 text-center font-mono text-green-600">{stats.total_living}</td>
                                        <td className="px-4 py-4 text-center font-mono text-[#ec1325]">{deadCount}</td>
                                        <td className="px-5 py-4 text-center font-mono text-orange-600">{stats.total_kk_utuh}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </details>

                    {/* Per Generation Table */}
                    <details className="group bg-white border border-[#e6dbdc] rounded-2xl overflow-hidden shadow-sm">
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <span className="material-symbols-outlined">layers</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#181112]">Statistik Per Generasi</h3>
                                    <p className="text-[10px] text-[#896165]">Rincian total dan rasio hidup tiap tingkatan generasi</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[#896165] transition-transform group-open:rotate-180">
                                keyboard_arrow_down
                            </span>
                        </summary>
                        <div className="p-0 border-t border-[#f4f0f0] overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#f8f6f6] text-[#896165] text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 border-b border-[#e6dbdc]">Generasi</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">Total</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♂</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♀</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center text-green-600">Hidup</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center text-[#ec1325]">Wafat</th>
                                        <th className="px-5 py-3 border-b border-[#e6dbdc]">Rasio Hidup</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f4f0f0]">
                                    {stats.generation_stats?.map((gen) => {
                                        const ratio = gen.total > 0 ? Math.round((gen.living / gen.total) * 100) : 0
                                        return (
                                            <tr key={gen.generation} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-3 font-bold text-[#181112]">
                                                    Gen {gen.generation}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono">{gen.total}</td>
                                                <td className="px-4 py-3 text-center font-mono text-blue-600">{gen.male}</td>
                                                <td className="px-4 py-3 text-center font-mono text-pink-500">{gen.female}</td>
                                                <td className="px-4 py-3 text-center font-mono text-green-600">{gen.living}</td>
                                                <td className="px-4 py-3 text-center font-mono text-[#ec1325]">{gen.total - gen.living}</td>
                                                <td className="px-5 py-3 w-40">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-green-500 h-full" style={{ width: `${ratio}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500 w-7">{ratio}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </details>

                    {/* Per Cemetery Table */}
                    <details className="group bg-white border border-[#e6dbdc] rounded-2xl overflow-hidden shadow-sm">
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-outlined">location_on</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#181112]">Sebaran Makam Keluarga</h3>
                                    <p className="text-[10px] text-[#896165]">Rincian tempat pemakaman anggota keluarga yang telah wafat</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[#896165] transition-transform group-open:rotate-180">
                                keyboard_arrow_down
                            </span>
                        </summary>
                        <div className="p-0 border-t border-[#f4f0f0] overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#f8f6f6] text-[#896165] text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 border-b border-[#e6dbdc]">Tempat Makam</th>
                                        <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">Jumlah Wafat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f4f0f0]">
                                    {stats.burial_place_stats?.map((item: { place: string; total: number }) => {
                                        return (
                                            <tr 
                                                key={item.place} 
                                                onClick={() => setSelectedCemetery(item.place)}
                                                className="hover:bg-gray-50/50 transition-colors cursor-pointer group/row"
                                            >
                                                <td className="px-5 py-3 font-bold text-[#181112] group-hover/row:text-[#ec1325] transition-colors">
                                                    {item.place}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono group-hover/row:text-[#ec1325] transition-colors">{item.total}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </div>

                {selectedCemetery && (
                    <CemeteryDetailModal
                        place={selectedCemetery}
                        onClose={() => setSelectedCemetery(null)}
                    />
                )}

                {/* Branches Grid */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#181112] flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#ec1325]">account_tree</span>
                                Daftar Qobilah
                            </h2>
                            <p className="text-xs text-[#896165] mt-1">Pilih salah satu cabang untuk melihat pohon silsilah detail</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {branches.map((branch: Branch) => (
                            <button
                                key={branch.id}
                                onClick={() => navigate(`/silsilah/branch/${branch.id}`)}
                                className="bg-white border border-[#e6dbdc] rounded-2xl p-6 text-left hover:border-[#ec1325]/50 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-[#ec1325] text-xl">arrow_right_alt</span>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 rounded-xl bg-[#181112] group-hover:bg-[#ec1325] transition-colors flex items-center justify-center text-white font-mono font-bold text-lg">
                                        {branch.order}
                                    </div>
                                    <h3 className="font-bold text-lg text-[#181112] truncate group-hover:text-[#ec1325] transition-colors">
                                        {branch.name.replace('Qobilah ', '')}
                                    </h3>
                                </div>

                                <p className="text-sm text-[#896165] mb-6 line-clamp-2 leading-relaxed">
                                    Keturunan {branch.name.replace('Qobilah ', '')} {branch.root_gender === 'female' ? 'binti' : 'bin'} Abdul Manan
                                </p>

                                <div className="mt-auto pt-4 border-t border-[#f4f0f0] flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-bold text-[#896165] uppercase tracking-tighter">
                                    <span className="flex items-center gap-1">
                                        {Number(branch.persons_count || 0) + Number(branch.spouse_count || 0)} Anggota
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1 text-green-600">
                                        {Number(branch.living_count || 0) + Number(branch.spouse_living_count || 0)} Hidup
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1 text-orange-600">
                                        {branch.kk_utuh_count} KK
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    )
}

interface CemeteryDetailModalProps {
    place: string
    onClose: () => void
}

function CemeteryDetailModal({ place, onClose }: CemeteryDetailModalProps) {
    const { data: persons, isLoading, error } = useCemeteryPersons(place)

    // Helper for formatting date
    const formatDate = (dateStr?: string | null): string => {
        if (!dateStr) return '-'
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[75vh] flex flex-col shadow-2xl overflow-hidden border border-[#e6dbdc] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#f4f0f0] bg-[#f8f6f6]">
                    <div>
                        <h3 className="font-bold text-lg text-[#181112]">Anggota di Makam</h3>
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-0.5">{place}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white text-[#896165] hover:text-[#ec1325] transition-colors border border-transparent hover:border-[#e6dbdc] flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined block text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <span className="material-symbols-outlined animate-spin text-[#ec1325] text-3xl">
                                progress_activity
                            </span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-6 text-red-500 text-sm">
                            Gagal memuat data anggota makam.
                        </div>
                    ) : !persons || persons.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm italic">
                            Tidak ada data anggota di makam ini.
                        </div>
                    ) : (
                        <div className="divide-y divide-[#f4f0f0]">
                            {persons.map((person) => (
                                <div key={person.id} className="py-3 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-[#181112] truncate">{person.full_name}</p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#896165]">
                                            <span className="font-medium">Wafat: {formatDate(person.death_date)}</span>
                                            <span>•</span>
                                            <span>{person.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                                        </div>
                                    </div>
                                    {person.focus_branch_id && (
                                        <Link
                                            to={`/silsilah/branch/${person.focus_branch_id}?focus=${person.id}`}
                                            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-[#ec1325]/10 hover:bg-[#ec1325] text-[#ec1325] hover:text-white rounded-lg text-xs font-bold transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">account_tree</span>
                                            Bagan
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
