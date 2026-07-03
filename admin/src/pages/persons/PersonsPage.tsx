import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ActionMenu } from '../../components/ActionMenu'
import { usePersons, useBranches, useDeletePerson, useGenerations } from '../../features/admin/hooks/useAdmin'
import type { PersonFilters, Person, Branch } from '../../types'
import { MultiSelect } from '../../components/MultiSelect'
import api from '../../lib/api'

export function PersonsPage() {
    const [filters, setFilters] = useState<PersonFilters>({
        branch_id: [],
        generation: [],
        per_page: 15,
        page: 1,
    })
    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isExporting, setIsExporting] = useState(false)

    const { data, isLoading, error } = usePersons(filters)
    const { data: branchesData } = useBranches()
    const { data: generationsData } = useGenerations()
    const deletePerson = useDeletePerson()

    const branches: Branch[] = branchesData?.data || []
    const generations: number[] = generationsData?.data || []
    const persons: Person[] = data?.data || []
    const meta = data?.meta

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        setFilters(prev => ({ ...prev, search: value, page: 1 }))
    }

    const handleFilterChange = (key: keyof PersonFilters, value: any) => {
        setFilters(prev => {
            const next = {
                ...prev,
                [key]: value,
                page: 1,
            }
            if (key === 'is_alive' && value === true) {
                delete next.burial_place
            }
            return next
        })
    }

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus "${name}"?`)) {
            deletePerson.mutate(id)
        }
    }

    const toggleSelectAll = () => {
        const pageIds = persons.map(p => p.id)
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
                Object.entries({ ...filters, search: search || undefined }).forEach(([k, v]) => {
                    if (v !== undefined && v !== '') params.append(k, String(v))
                })
            }

            const response = await api.get(`/export/persons?${params.toString()}`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response as any]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `silsilah_anggota_${new Date().getTime()}.csv`)
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
                    <h1 className="text-xl font-bold text-[#181112]">Daftar Anggota</h1>
                    <p className="text-sm text-[#896165]">
                        {meta ? `Total ${meta.total} anggota` : 'Kelola data silsilah keluarga'}
                    </p>
                </div>
                <Link
                    to="/persons/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Tambah Anggota
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-[#e6dbdc] flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-48">
                    <input
                        type="text"
                        placeholder="Cari nama..."
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
                    value={filters.gender || ''}
                    onChange={(e) => handleFilterChange('gender', (e.target.value || undefined) as 'male' | 'female' | undefined)}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                >
                    <option value="">Semua Gender</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                </select>
                <select
                    value={filters.is_alive === undefined ? '' : filters.is_alive ? '1' : '0'}
                    onChange={(e) => handleFilterChange('is_alive', e.target.value === '' ? undefined : e.target.value === '1')}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                >
                    <option value="">Semua Status</option>
                    <option value="1">Masih Hidup</option>
                    <option value="0">Almarhum</option>
                </select>
                <select
                    value={filters.is_married === undefined ? '' : filters.is_married ? '1' : '0'}
                    onChange={(e) => handleFilterChange('is_married', e.target.value === '' ? undefined : e.target.value === '1')}
                    className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                >
                    <option value="">Semua Status Nikah</option>
                    <option value="1">Sudah Menikah</option>
                    <option value="0">Belum Menikah</option>
                </select>
                {filters.is_alive !== true && (
                    <select
                        value={filters.burial_place || ''}
                        onChange={(e) => handleFilterChange('burial_place', e.target.value || undefined)}
                        className="px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50 animate-in fade-in duration-200"
                    >
                        <option value="">Semua Tempat Makam</option>
                        <option value="SURATAN">SURATAN</option>
                        <option value="MIJI BARU">MIJI BARU</option>
                        <option value="PLOSOSARI">PLOSOSARI</option>
                        <option value="MEDALI">MEDALI</option>
                    </select>
                )}

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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#f8f6f6] border-b border-[#e6dbdc]">
                                <th className="w-10 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={persons.length > 0 && persons.every(p => selectedIds.has(p.id))}
                                        onChange={toggleSelectAll}
                                        className="rounded border-[#e6dbdc] text-[#ec1325] focus:ring-[#ec1325]"
                                    />
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Nama</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Qobilah</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Gen</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Gender</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-[#181112]">Status</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-[#181112] sticky right-0 bg-[#f8f6f6] border-l border-[#e6dbdc] md:border-l-0 z-10">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-[#896165]">
                                        <span className="material-symbols-outlined animate-spin text-2xl mb-2 block">progress_activity</span>
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-red-500">
                                        <span className="material-symbols-outlined text-2xl mb-2 block">error</span>
                                        Gagal memuat data
                                    </td>
                                </tr>
                            ) : persons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-[#896165]">
                                        <span className="material-symbols-outlined text-2xl mb-2 block">search_off</span>
                                        Data tidak ditemukan
                                    </td>
                                </tr>
                            ) : (
                                persons.map((person) => (
                                    <tr key={person.id} className={`border-b border-[#e6dbdc] bg-white hover:bg-[#f8f6f6]/50 transition-colors ${selectedIds.has(person.id) ? 'bg-[#ec1325]/5' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(person.id)}
                                                onChange={() => toggleSelect(person.id)}
                                                className="rounded border-[#e6dbdc] text-[#ec1325] focus:ring-[#ec1325]"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${person.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                                    }`}>
                                                    {person.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#181112] whitespace-nowrap">{person.full_name}</p>
                                                    {person.nickname && (
                                                        <p className="text-xs text-[#896165] whitespace-nowrap">{person.nickname}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#181112] whitespace-nowrap">
                                            {person.qobilah_name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#181112]">
                                            {person.generation}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${person.gender === 'male'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-pink-50 text-pink-700'
                                                }`}>
                                                {person.gender === 'male' ? 'L' : 'P'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${person.is_alive
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {person.is_alive ? 'Hidup' : 'Almarhum'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right sticky right-0 bg-inherit border-l border-[#e6dbdc] md:border-l-0 z-10">
                                            <ActionMenu>
                                                <Link
                                                    to={`/persons/${person.id}/edit`}
                                                    className="p-1.5 hover:bg-[#f8f6f6] rounded transition-colors flex items-center gap-2 md:justify-center w-full"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] text-[#896165]">edit</span>
                                                    <span className="md:hidden text-sm font-medium text-[#896165]">Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(person.id, person.full_name)}
                                                    className="p-1.5 hover:bg-red-50 rounded transition-colors flex items-center gap-2 md:justify-center w-full"
                                                    title="Hapus"
                                                    disabled={deletePerson.isPending}
                                                >
                                                    <span className="material-symbols-outlined text-[18px] text-red-500">delete</span>
                                                    <span className="md:hidden text-sm font-medium text-red-500">Hapus</span>
                                                </button>
                                            </ActionMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {meta && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-[#896165]">
                        Menampilkan {persons.length} dari {meta.total} data
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
