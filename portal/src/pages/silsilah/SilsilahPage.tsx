import { useNavigate } from 'react-router-dom'
import { useBranches, type Branch } from '../../features/silsilah'
import { MobileLayout } from '../../components/layout/MobileLayout'

export function SilsilahPage() {
    const navigate = useNavigate()
    const { data, isLoading, error } = useBranches()

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
        total_living_spouses: 0
    }


    return (
        <MobileLayout>
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
                {/* Hero / Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#181112] mb-2 tracking-tight">
                        Silsilah Keluarga
                    </h1>
                    <p className="text-[#896165] max-w-2xl">
                        Jelajahi garis keturunan dan silsilah lengkap Bani Abdul Manan. Pilih qobilah untuk melihat visualisasi pohon detail.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm flex items-center gap-4">
                        <div className="size-12 rounded-full bg-[#ec1325]/10 flex items-center justify-center text-[#ec1325]">
                            <span className="material-symbols-outlined text-2xl">group</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#181112]">{stats.total_persons}</p>
                            <p className="text-sm text-[#896165] font-medium">Total Anggota</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {stats.total_descendants || 0} Keturunan + {stats.total_spouses || 0} Menantu
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm flex items-center gap-4">
                        <div className="size-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <span className="material-symbols-outlined text-2xl">favorite</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#181112]">{stats.total_living}</p>
                            <p className="text-sm text-[#896165] font-medium">Masih Hidup</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {stats.total_living_descendants || 0} Keturunan + {stats.total_living_spouses || 0} Menantu
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm flex items-center gap-4">
                        <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined text-2xl">account_tree</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#181112]">{branches.length}</p>
                            <p className="text-sm text-[#896165] font-medium">Total Qobilah</p>
                        </div>
                    </div>
                </div>

                {/* Branches Grid */}
                <div>
                    <h2 className="text-xl font-bold text-[#181112] mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ec1325]">hub</span>
                        Pilih Qobilah
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {branches.map((branch: Branch) => (
                            <button
                                key={branch.id}
                                onClick={() => navigate(`/silsilah/branch/${branch.id}`)}
                                className="bg-white border border-[#e6dbdc] rounded-xl p-6 text-left hover:border-[#ec1325] hover:shadow-md transition-all group flex flex-col h-full"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="size-12 rounded-full bg-[#f8f6f6] group-hover:bg-[#ec1325] transition-colors flex items-center justify-center text-[#181112] group-hover:text-white border border-[#e6dbdc] group-hover:border-[#ec1325]">
                                        <span className="font-bold text-lg">{branch.order}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[#e6dbdc] group-hover:text-[#ec1325]/40 transition-colors">
                                        arrow_forward
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-[#181112] mb-1 group-hover:text-[#ec1325] transition-colors">
                                    {branch.name}
                                </h3>
                                <p className="text-sm text-[#896165] mb-4 line-clamp-2">
                                    Keturunan dari {branch.name.replace('Qobilah ', '')} {branch.root_gender === 'female' ? 'binti' : 'bin'} Abdul Manan
                                </p>

                                <div className="mt-auto pt-4 border-t border-[#f4f0f0] flex items-center gap-4 text-xs font-medium text-[#896165]">
                                    <span className="flex items-center gap-1 bg-[#f8f6f6] px-2 py-1 rounded">
                                        <span className="material-symbols-outlined text-[14px]">group</span>
                                        <span className="font-semibold">{branch.persons_count || 0}</span>
                                        <span className="text-[10px] text-gray-500 ml-1">
                                            (+{branch.spouse_count || 0} menantu)
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                                        <span className="material-symbols-outlined text-[14px]">favorite</span>
                                        {branch.living_count || 0}
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
