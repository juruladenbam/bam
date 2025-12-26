import { Link } from 'react-router-dom'

export function MarriagesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">Daftar Pernikahan</h1>
                    <p className="text-sm text-[#896165]">Kelola data pernikahan keluarga</p>
                </div>
                <Link
                    to="/marriages/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Tambah Pernikahan
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-[#e6dbdc] flex flex-wrap gap-4">
                <div className="flex-1 min-w-48">
                    <input
                        type="text"
                        placeholder="Cari nama suami/istri..."
                        className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                    />
                </div>
                <select className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50">
                    <option value="">Semua Status</option>
                    <option value="1">Aktif</option>
                    <option value="0">Cerai</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e6dbdc] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#f8f6f6] border-b border-[#e6dbdc]">
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Suami</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Istri</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Tahun</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Anak</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-[#181112]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-[#896165]">
                                <span className="material-symbols-outlined animate-spin text-2xl mb-2 block">progress_activity</span>
                                Memuat data...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#896165]">Menampilkan 0 dari 0 data</p>
                <div className="flex gap-2">
                    <button disabled className="px-3 py-1.5 border border-[#e6dbdc] rounded text-sm text-[#896165] bg-white">
                        Sebelumnya
                    </button>
                    <button disabled className="px-3 py-1.5 border border-[#e6dbdc] rounded text-sm text-[#896165] bg-white">
                        Selanjutnya
                    </button>
                </div>
            </div>
        </div>
    )
}
