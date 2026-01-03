import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubmissions, SubmissionList } from '../../features/submissions'
import type { SubmissionFilters } from '../../features/submissions'

export function SubmissionListPage() {
    const [filters, setFilters] = useState<SubmissionFilters>({ status: 'pending' })
    const { data, isLoading } = useSubmissions(filters)

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-[#ec1325]">Dashboard</Link>
                    <span>/</span>
                    <span>Submission</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Data Submission</h1>
                        <p className="text-gray-500 mt-1">
                            Review dan setujui pengajuan data dari member
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {(['pending', 'approved', 'rejected'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilters({ ...filters, status })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.status === status
                                        ? 'bg-[#ec1325] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'pending' ? 'Menunggu' :
                                    status === 'approved' ? 'Disetujui' : 'Ditolak'}
                            </button>
                        ))}
                        <button
                            onClick={() => setFilters({ ...filters, status: undefined })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!filters.status
                                    ? 'bg-[#ec1325] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Semua
                        </button>
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filters.type || ''}
                        onChange={(e) => setFilters({
                            ...filters,
                            type: e.target.value as any || undefined
                        })}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#ec1325]"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="birth">Kelahiran</option>
                        <option value="marriage">Pernikahan</option>
                        <option value="death">Kematian</option>
                        <option value="correction">Koreksi</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            {data?.meta && (
                <div className="mb-4 text-sm text-gray-500">
                    Menampilkan {data.data.length} dari {data.meta.total} submission
                </div>
            )}

            {/* List */}
            <SubmissionList
                submissions={data?.data || []}
                isLoading={isLoading}
            />

            {/* Pagination */}
            {data?.meta && data.meta.last_page > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                        disabled={!filters.page || filters.page <= 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <span className="px-4 py-2">
                        Halaman {data.meta.current_page} dari {data.meta.last_page}
                    </span>
                    <button
                        onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                        disabled={data.meta.current_page >= data.meta.last_page}
                        className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}
        </div>
    )
}

export default SubmissionListPage
