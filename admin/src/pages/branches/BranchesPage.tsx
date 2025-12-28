import { useState } from 'react'
import { useBranches } from '../../features/admin/hooks/useAdmin'
import type { Branch } from '../../types'

export function BranchesPage() {
    const { data, isLoading, error } = useBranches()
    const rawBranches: Branch[] = data?.data || []

    // Sorting state
    const [sortBy, setSortBy] = useState<'order' | 'count'>('order')

    // Derived sorted data
    const branches = [...rawBranches].sort((a, b) => {
        if (sortBy === 'count') {
            // Sort by Total Populasi (Persons + Spouses) or just Persons?
            // "Sortir berdasarkan anggota" usually means Descendants. 
            // Let's use Persons Count (Descendants) as primary, Order as tiebreaker
            const countA = (a.persons_count || 0)
            const countB = (b.persons_count || 0)
            if (countB !== countA) return countB - countA
        }
        return a.order - b.order
    })

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
            {/* Header with Sort Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">Daftar Qobilah</h1>
                    <p className="text-sm text-[#896165]">Total {branches.length} qobilah</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-[#e6dbdc]">
                    <button
                        onClick={() => setSortBy('order')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${sortBy === 'order'
                                ? 'bg-[#ec1325] text-white shadow-sm'
                                : 'text-[#896165] hover:bg-[#f8f6f6]'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                        Sesuai Urutan
                    </button>
                    <button
                        onClick={() => setSortBy('count')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${sortBy === 'count'
                                ? 'bg-[#ec1325] text-white shadow-sm'
                                : 'text-[#896165] hover:bg-[#f8f6f6]'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">group_add</span>
                        Terbanyak
                    </button>
                </div>
            </div>

            {/* Global Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Total Populasi (Anggota + Menantu) */}
                <div className="bg-white p-4 rounded-xl border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-[#ec1325] text-xl">groups</span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Keluarga</span>
                    </div>
                    <p className="text-2xl font-bold text-[#181112]">
                        {branches.reduce((sum, b) => sum + (b.persons_count || 0) + (b.spouse_count || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-400">Anggota ({branches.reduce((sum, b) => sum + (b.persons_count || 0), 0)}) + Menantu ({branches.reduce((sum, b) => sum + (b.spouse_count || 0), 0)})</p>
                </div>

                {/* 2. Total Anggota (Keturunan) */}
                <div className="bg-white p-4 rounded-xl border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-blue-600 text-xl">family_history</span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Anggota (Keturunan)</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                        {branches.reduce((sum, b) => sum + (b.persons_count || 0), 0)}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">favorite</span>
                            {branches.reduce((sum, b) => sum + (b.living_count || 0), 0)} Hidup
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">heart_broken</span>
                            {branches.reduce((sum, b) => sum + ((b.persons_count || 0) - (b.living_count || 0)), 0)} Wafat
                        </span>
                    </div>
                </div>

                {/* 3. Total Menantu */}
                <div className="bg-white p-4 rounded-xl border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-orange-500 text-xl">diversity_3</span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Menantu</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                        {branches.reduce((sum, b) => sum + (b.spouse_count || 0), 0)}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">favorite</span>
                            {branches.reduce((sum, b) => sum + (b.spouse_living_count || 0), 0)} Hidup
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">heart_broken</span>
                            {branches.reduce((sum, b) => sum + ((b.spouse_count || 0) - (b.spouse_living_count || 0)), 0)} Wafat
                        </span>
                    </div>
                </div>

                {/* 4. Total Hidup (Semua) */}
                <div className="bg-white p-4 rounded-xl border border-[#e6dbdc] shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-green-500 text-xl">favorite</span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hidup</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {branches.reduce((sum, b) => sum + (b.living_count || 0) + (b.spouse_living_count || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-400">
                        Dari Total Populasi
                    </p>
                </div>
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
