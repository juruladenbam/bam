import { useBranches } from '../../features/admin/hooks/useAdmin'
import type { Branch } from '../../types'

export function BranchesPage() {
    const { data, isLoading, error } = useBranches()
    const branches: Branch[] = data?.data || []

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">Daftar Qobilah</h1>
                    <p className="text-sm text-[#896165]">Lihat statistik per qobilah</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-[#e6dbdc] p-6 animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-lg bg-[#f8f6f6]"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-[#f8f6f6] rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-[#f8f6f6] rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
                    <p>Gagal memuat data</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-[#181112]">Daftar Qobilah</h1>
                <p className="text-sm text-[#896165]">Total {branches.length} qobilah</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                    <div key={branch.id} className="bg-white rounded-xl border border-[#e6dbdc] p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-lg bg-[#ec1325]/10 flex items-center justify-center text-[#ec1325] font-bold text-lg">
                                {branch.order}
                            </div>
                            <div>
                                <h3 className="font-bold text-[#181112]">{branch.name}</h3>
                                <p className="text-xs text-[#896165]">Urutan ke-{branch.order}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#e6dbdc]">
                            <div className="text-center">
                                <p className="text-lg font-bold text-[#181112]">{branch.persons_count || 0}</p>
                                <p className="text-xs text-[#896165]">Anggota</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-600">{branch.living_count || 0}</p>
                                <p className="text-xs text-[#896165]">Hidup</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-[#896165]">{branch.spouse_count || 0}</p>
                                <p className="text-xs text-[#896165]">Menantu</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
