import { useDashboard } from '../features/admin/hooks/useAdmin'
import { Link } from 'react-router-dom'

export function DashboardPage() {
    const { data, isLoading, error } = useDashboard()

    const stats = data?.data?.stats
    const recentPersons = data?.data?.recent_persons || []

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-[#ec1325]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#ec1325]">group</span>
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-[#181112]">{stats?.total_persons || 0}</p>
                            )}
                            <p className="text-sm text-[#896165]">Total Anggota</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-green-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">favorite</span>
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-[#181112]">{stats?.total_alive || 0}</p>
                            )}
                            <p className="text-sm text-[#896165]">Masih Hidup</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-pink-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-pink-600">favorite</span>
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-[#181112]">{stats?.total_marriages || 0}</p>
                            )}
                            <p className="text-sm text-[#896165]">Pernikahan</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">account_tree</span>
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-[#181112]">{stats?.total_branches || 0}</p>
                            )}
                            <p className="text-sm text-[#896165]">Qobilah</p>
                        </div>
                    </div>
                </div>
                <Link to="/submissions" className="bg-white rounded-xl p-6 border border-[#e6dbdc] hover:border-yellow-400 hover:shadow-md transition-all block">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-yellow-600">inbox</span>
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-[#181112]">{(stats as any)?.pending_submissions || 0}</p>
                            )}
                            <p className="text-sm text-[#896165]">Submission Pending</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                <h3 className="font-bold text-[#181112] mb-4">Aksi Cepat</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/persons/new" className="inline-flex items-center gap-2 px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Tambah Anggota
                    </Link>
                    <Link to="/marriages/new" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e6dbdc] text-[#181112] rounded-lg font-medium hover:bg-[#f8f6f6] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        Tambah Pernikahan
                    </Link>
                </div>
            </div>

            {/* Recent Persons */}
            <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                <h3 className="font-bold text-[#181112] mb-4">Anggota Terbaru</h3>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : recentPersons.length === 0 ? (
                    <p className="text-sm text-[#896165]">Belum ada data anggota</p>
                ) : (
                    <div className="space-y-2">
                        {recentPersons.map((person) => (
                            <div key={person.id} className="flex items-center gap-3 p-2 hover:bg-[#f8f6f6] rounded-lg transition-colors">
                                <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${person.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                    }`}>
                                    {person.full_name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#181112]">{person.full_name}</p>
                                    <p className="text-xs text-[#896165]">
                                        Ditambahkan {new Date(person.created_at).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <Link
                                    to={`/persons/${person.id}/edit`}
                                    className="text-[#896165] hover:text-[#ec1325] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
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
