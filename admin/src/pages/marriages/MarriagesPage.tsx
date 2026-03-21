import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarriages, useDeleteMarriage, useBranches, useGenerations } from '../../features/admin/hooks/useAdmin'
import type { MarriageFilters, Marriage } from '../../types'
import { MultiSelect } from '../../components/MultiSelect'
import api from '../../lib/api'

export function MarriagesPage() {
    const [filters, setFilters] = useState<MarriageFilters>({
        branch_id: [],
        generation: [],
        per_page: 15,
        page: 1,
    })
    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isExporting, setIsExporting] = useState(false)

    const { data: branchesData } = useBranches()
    const { data: generationsData } = useGenerations()
    const { data, isLoading, error } = useMarriages(filters)
    const deleteMarriage = useDeleteMarriage()

    const marriages: Marriage[] = data?.data || []
    const branches = branchesData?.data || []
    const generations = generationsData?.data || []
    const meta = data?.meta

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        setFilters(prev => ({ ...prev, search: value, page: 1 }))
    }

    const handleFilterChange = (key: keyof MarriageFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value,
            page: 1,
        }))
    }

    const handleDelete = async (id: number, husbandName: string, wifeName: string) => {
        if (confirm(`Yakin ingin menghapus pernikahan "${husbandName} & ${wifeName}"?`)) {
            deleteMarriage.mutate(id)
        }
    }

    const toggleSelectAll = () => {
        const pageIds = marriages.map(m => m.id)
        const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id))
        
        const next = new Set(selectedIds)
        if (allPageSelected) {
            pageIds.forEach(id => next.delete(id))
        } else {
            pageIds.forEach(id => next.add(id))
        }
        setSelectedIds(next)
    }

    const toggleSelect = (id: number) => {
        const next = new Set(selectedIds)
        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        setSelectedIds(next)
    }

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    const handleExport = async () => {
        try {
            setIsExporting(true)
            const params = new URLSearchParams()
            
            if (selectedIds.size > 0) {
                params.append('ids', Array.from(selectedIds).join(','))
            } else {
                Object.entries(filters).forEach(([k, v]) => {
                    if (v !== undefined && v !== '') params.append(k, String(v))
                })
            }

            const response = await api.get(`/export/marriages?${params.toString()}`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response as any]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `silsilah_pernikahan_${new Date().getTime()}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('Export gagal:', err)
            alert('Gagal mengekspor data. Silakan coba lagi.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">Daftar Pernikahan</h1>
                    <p className="text-sm text-[#896165]">
                        {meta ? `Total ${meta.total} pernikahan` : 'Kelola data pernikahan keluarga'}
                    </p>
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
            <div className="bg-white rounded-xl p-4 border border-[#e6dbdc] flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-48">
                    <input
                        type="text"
                        placeholder="Cari nama suami/istri..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                    />
                </div>
                <MultiSelect
                    label="Semua Qobilah"
                    options={branches.map(b => ({ id: b.id, name: b.name }))}
                    selected={Array.isArray(filters.branch_id) ? filters.branch_id : []}
                    onChange={(ids) => handleFilterChange('branch_id', ids)}
                />
                <MultiSelect
                    label="Semua Gen"
                    options={generations.map(g => ({ id: g, name: `Gen ${g}` }))}
                    selected={Array.isArray(filters.generation) ? filters.generation : []}
                    onChange={(ids) => handleFilterChange('generation', ids)}
                />
                <select
                    value={filters.is_active === undefined ? '' : filters.is_active ? '1' : '0'}
                    onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === '1')}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                >
                    <option value="">Semua Status</option>
                    <option value="1">Aktif</option>
                    <option value="0">Cerai/Wafat</option>
                </select>
                <select
                    value={filters.is_internal === undefined ? '' : filters.is_internal ? '1' : '0'}
                    onChange={(e) => handleFilterChange('is_internal', e.target.value === '' ? undefined : e.target.value === '1')}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                >
                    <option value="">Semua Tipe</option>
                    <option value="1">Internal (Kerabat)</option>
                    <option value="0">Eksternal</option>
                </select>

                <div className="h-8 w-px bg-[#e6dbdc] mx-1 hidden lg:block"></div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e6dbdc] text-[#181112] rounded-lg font-medium hover:bg-[#f8f6f6] transition-colors disabled:opacity-50"
                >
                    <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-spin' : ''}`}>
                        {isExporting ? 'progress_activity' : 'download'}
                    </span>
                    {isExporting && selectedIds.size > 0 
                        ? `Ekspor ${selectedIds.size}` 
                        : selectedIds.size > 0 
                        ? `Ekspor Terpilih (${selectedIds.size})` 
                        : isExporting 
                        ? 'Mengekspor...' 
                        : 'Ekspor Semua'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e6dbdc] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#f8f6f6] border-b border-[#e6dbdc]">
                            <th className="w-10 px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={marriages.length > 0 && marriages.every(m => selectedIds.has(m.id))}
                                    onChange={toggleSelectAll}
                                    className="rounded border-[#e6dbdc] text-[#ec1325] focus:ring-[#ec1325]"
                                />
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Suami</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Istri</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Qobilah</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Tahun</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Anak</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-[#181112]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-[#896165]">
                                    <span className="material-symbols-outlined animate-spin text-2xl mb-2 block">progress_activity</span>
                                    Memuat data...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-red-500">
                                    <span className="material-symbols-outlined text-2xl mb-2 block">error</span>
                                    Gagal memuat data
                                </td>
                            </tr>
                        ) : marriages.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-[#896165]">
                                    <span className="material-symbols-outlined text-2xl mb-2 block">search_off</span>
                                    Data tidak ditemukan
                                </td>
                            </tr>
                        ) : (
                            marriages.map((marriage) => (
                                <tr key={marriage.id} className={`border-b border-[#e6dbdc] hover:bg-[#f8f6f6]/50 transition-colors ${selectedIds.has(marriage.id) ? 'bg-[#ec1325]/5' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(marriage.id)}
                                            onChange={() => toggleSelect(marriage.id)}
                                            className="rounded border-[#e6dbdc] text-[#ec1325] focus:ring-[#ec1325]"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-50 text-blue-600">
                                                {marriage.husband?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="font-medium text-[#181112]">
                                                {marriage.husband?.full_name || 'Tidak diketahui'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold bg-pink-50 text-pink-600">
                                                {marriage.wife?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="font-medium text-[#181112]">
                                                {marriage.wife?.full_name || 'Tidak diketahui'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#181112]">
                                        {marriage.husband?.qobilah_name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#181112]">
                                        {marriage.marriage_date ? new Date(marriage.marriage_date).getFullYear() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#181112]">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f8f6f6] rounded text-xs">
                                            <span className="material-symbols-outlined text-[14px]">child_care</span>
                                            {marriage.children_count || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium w-fit ${marriage.is_active
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {marriage.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                            {marriage.is_internal && (
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 w-fit">
                                                    Internal
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                to={`/marriages/${marriage.id}/edit`}
                                                className="p-1.5 hover:bg-[#f8f6f6] rounded transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-[#896165]">edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(
                                                    marriage.id,
                                                    marriage.husband?.full_name || '',
                                                    marriage.wife?.full_name || ''
                                                )}
                                                className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                                title="Hapus"
                                                disabled={deleteMarriage.isPending}
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-red-500">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-[#896165]">
                        Menampilkan {marriages.length} dari {meta.total} data
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(meta.current_page - 1)}
                            disabled={meta.current_page <= 1}
                            className="px-3 py-1.5 border border-[#e6dbdc] rounded text-sm text-[#896165] bg-white disabled:opacity-50 hover:bg-[#f8f6f6] transition-colors"
                        >
                            Sebelumnya
                        </button>
                        <span className="px-3 py-1.5 text-sm text-[#181112]">
                            {meta.current_page} / {meta.last_page}
                        </span>
                        <button
                            onClick={() => handlePageChange(meta.current_page + 1)}
                            disabled={meta.current_page >= meta.last_page}
                            className="px-3 py-1.5 border border-[#e6dbdc] rounded text-sm text-[#896165] bg-white disabled:opacity-50 hover:bg-[#f8f6f6] transition-colors"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
