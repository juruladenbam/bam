import { useDashboard } from '../features/admin/hooks/useAdmin'
import { Link } from 'react-router-dom'

export function DashboardPage() {
    const { data, isLoading, error } = useDashboard()

    const stats = data?.data?.stats
    const generationStats = data?.data?.generation_stats || []
    const branchStats = data?.data?.branch_stats || []
    const recentPersons = data?.data?.recent_persons || []

    return (
        <div className="space-y-8">
            {/* Main Stats Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#181112]">Ringkasan Statistik</h1>
                <p className="text-sm text-[#896165]">Gambaran umum data silsilah seluruh qobilah</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Members with Gender */}
                <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 rounded-lg bg-[#ec1325]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#ec1325]">groups</span>
                        </div>
                        <span className="text-xs font-bold text-[#896165] uppercase tracking-wider">Total Anggota</span>
                    </div>
                    <p className="text-3xl font-bold text-[#181112] mb-1">{stats?.total_persons || 0}</p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                            <span className="material-symbols-outlined text-[14px]">male</span> {stats?.total_male || 0}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-pink-500">
                            <span className="material-symbols-outlined text-[14px]">female</span> {stats?.total_female || 0}
                        </span>
                    </div>
                </div>

                {/* Living Stats */}
                <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">favorite</span>
                        </div>
                        <span className="text-xs font-bold text-[#896165] uppercase tracking-wider">Masih Hidup</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-1">{stats?.total_alive || 0}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                        {stats?.total_persons ? Math.round((stats.total_alive / stats.total_persons) * 100) : 0}% dari total
                    </p>
                </div>

                {/* Descendants vs Spouses */}
                <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">family_history</span>
                        </div>
                        <span className="text-xs font-bold text-[#896165] uppercase tracking-wider">Ktrn vs Menantu</span>
                    </div>
                    <p className="text-3xl font-bold text-[#181112] mb-1">{stats?.total_descendants || 0}</p>
                    <p className="text-[10px] text-[#896165] font-medium">
                        + {stats?.total_spouses || 0} Menantu
                    </p>
                </div>

                {/* Families & Branches */}
                <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-600">home</span>
                        </div>
                        <span className="text-xs font-bold text-[#896165] uppercase tracking-wider">Keluarga (KK)</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 mb-1">{stats?.total_kk_utuh || 0}</p>
                    <p className="text-[10px] text-[#896165] font-medium">
                        Di {stats?.total_branches || 0} Qobilah
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generation Stats Table */}
                <div className="bg-white rounded-xl border border-[#e6dbdc] overflow-hidden">
                    <div className="p-4 border-b border-[#f4f0f0] flex items-center justify-between bg-gray-50/30">
                        <h3 className="font-bold text-[#181112] flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">layers</span>
                            Statistik Per Generasi
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8f6f6] text-[#896165] text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 border-b border-[#e6dbdc]">Gen</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">Total</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♂</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♀</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center text-green-600">Hidup</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f4f0f0]">
                                {generationStats.map((gen: any) => (
                                    <tr key={gen.generation} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-bold text-[#181112]">Gen {gen.generation}</td>
                                        <td className="px-4 py-3 text-center font-mono">{gen.total}</td>
                                        <td className="px-4 py-3 text-center font-mono text-blue-600">{gen.male}</td>
                                        <td className="px-4 py-3 text-center font-mono text-pink-500">{gen.female}</td>
                                        <td className="px-4 py-3 text-center font-mono text-green-600">{gen.living}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Qobilah Stats Table */}
                <div className="bg-white rounded-xl border border-[#e6dbdc] overflow-hidden">
                    <div className="p-4 border-b border-[#f4f0f0] flex items-center justify-between bg-gray-50/30">
                        <h3 className="font-bold text-[#181112] flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">analytics</span>
                            Statistik Per Qobilah
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#f8f6f6] text-[#896165] text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 border-b border-[#e6dbdc]">Qobilah</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">Ktrn</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">Mntu</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♂</th>
                                    <th className="px-4 py-3 border-b border-[#e6dbdc] text-center">♀</th>
                                    <th className="px-5 py-3 border-b border-[#e6dbdc] text-center">KK</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f4f0f0]">
                                {branchStats.map((branch: any) => (
                                    <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-bold text-[#181112] truncate max-w-[120px]">
                                            {branch.name.replace('Qobilah ', '')}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono">{branch.persons_count}</td>
                                        <td className="px-4 py-3 text-center font-mono text-gray-400">{branch.spouse_count}</td>
                                        <td className="px-4 py-3 text-center font-mono text-blue-600">{branch.male_count}</td>
                                        <td className="px-4 py-3 text-center font-mono text-pink-500">{branch.female_count}</td>
                                        <td className="px-5 py-3 text-center font-mono font-bold text-orange-600">{branch.kk_utuh_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Persons List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#e6dbdc] overflow-hidden h-fit">
                    <div className="p-4 border-b border-[#f4f0f0] bg-gray-50/30 flex items-center justify-between">
                        <h3 className="font-bold text-[#181112]">Anggota Terbaru</h3>
                        <Link to="/persons" className="text-xs font-bold text-[#ec1325] hover:underline">Lihat Semua</Link>
                    </div>
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                            ))}
                        </div>
                    ) : recentPersons.length === 0 ? (
                        <div className="p-8 text-center text-[#896165] text-sm italic">Belum ada data anggota</div>
                    ) : (
                        <div className="divide-y divide-[#f4f0f0]">
                            {recentPersons.map((person: any) => (
                                <div key={person.id} className="flex items-center gap-4 p-4 hover:bg-[#f8f6f6] transition-colors">
                                    <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${person.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                        }`}>
                                        {person.full_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#181112] truncate">{person.full_name}</p>
                                        <p className="text-[10px] text-[#896165] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            Dibuat {new Date(person.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <Link to={`/persons/${person.id}/edit`} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#e6dbdc] shadow-sm">
                                        <span className="material-symbols-outlined text-[20px] text-[#896165]">edit</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submissions & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm">
                        <h3 className="font-bold text-[#181112] mb-4">Aksi Cepat</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link to="/persons/new" className="flex items-center justify-center gap-2 px-4 py-3 bg-[#ec1325] text-white rounded-xl font-bold text-sm hover:bg-[#c91020] transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                                Tambah Anggota
                            </Link>
                            <Link to="/marriages/new" className="flex items-center justify-center gap-2 px-4 py-3 bg-[#f8f6f6] border border-[#e6dbdc] text-[#181112] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">favorite</span>
                                Tambah Pernikahan
                            </Link>
                        </div>
                    </div>

                    <Link to="/submissions" className="bg-white rounded-xl p-5 border border-[#e6dbdc] shadow-sm hover:border-[#ec1325]/50 transition-all block group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="size-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-yellow-600">inbox</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:text-[#ec1325] transition-colors">arrow_forward</span>
                        </div>
                        <p className="text-2xl font-bold text-[#181112]">{(stats as any)?.pending_submissions || 0}</p>
                        <p className="text-xs font-bold text-[#896165] uppercase tracking-wider">Submission Pending</p>
                    </Link>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                    <span className="material-symbols-outlined text-sm mr-2">error</span>
                    Gagal memuat data dashboard
                </div>
            )}
        </div>
    )
}
