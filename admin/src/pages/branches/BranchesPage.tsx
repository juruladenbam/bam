export function BranchesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-[#181112]">Daftar Qobilah</h1>
                <p className="text-sm text-[#896165]">Lihat statistik per qobilah</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder cards */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-[#e6dbdc] p-6 animate-pulse">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-lg bg-[#f8f6f6]"></div>
                            <div className="flex-1">
                                <div className="h-5 bg-[#f8f6f6] rounded w-32 mb-2"></div>
                                <div className="h-3 bg-[#f8f6f6] rounded w-20"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-[#f8f6f6] rounded"></div>
                            <div className="h-3 bg-[#f8f6f6] rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
