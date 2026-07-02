import { useState, useEffect } from 'react'
import { useBranches } from '../../silsilah'
import { useSearchPersonsAdvanced } from '../hooks/useRsvp'
import type { Person } from '../../silsilah/types'

interface PersonSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (person: Person) => void;
    initialQuery?: string;
}

export function PersonSearchModal({
    isOpen,
    onClose,
    onSelect,
    initialQuery = ''
}: PersonSearchModalProps) {
    const [searchName, setSearchName] = useState(initialQuery)
    const [selectedBranch, setSelectedBranch] = useState<string>('')
    const [selectedGeneration, setSelectedGeneration] = useState<string>('')

    // Fetch branches for qobilah dropdown
    const { data: branchesData } = useBranches()
    const branches = branchesData?.branches || []

    // Fetch search results based on active filters
    const { data: results, isLoading, isFetching } = useSearchPersonsAdvanced({
        q: searchName,
        branch_id: selectedBranch,
        generation: selectedGeneration
    })

    // Reset fields on open
    useEffect(() => {
        if (isOpen) {
            setSearchName(initialQuery)
            setSelectedBranch('')
            setSelectedGeneration('')
        }
    }, [isOpen, initialQuery])

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e6dbdc] flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#e6dbdc] flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#181112] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ec1325]">person_search</span>
                        Cari Data Silsilah
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Filter Controls */}
                <div className="p-6 bg-gray-50 border-b border-[#e6dbdc] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Name Input */}
                        <div className="sm:col-span-1">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Nama</label>
                            <input
                                type="text"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                placeholder="Cari nama..."
                                className="w-full px-3 py-2 bg-white border border-[#e6dbdc] rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325]"
                            />
                        </div>

                        {/* Qobilah Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Qobilah (Cabang)</label>
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#e6dbdc] rounded-lg text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325]"
                            >
                                <option value="">Semua Qobilah</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Generasi Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Generasi</label>
                            <select
                                value={selectedGeneration}
                                onChange={(e) => setSelectedGeneration(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#e6dbdc] rounded-lg text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325]"
                            >
                                <option value="">Semua Generasi</option>
                                {[1, 2, 3, 4, 5, 6, 7].map((gen) => (
                                    <option key={gen} value={gen}>
                                        Generasi {gen}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[250px] relative">
                    {isLoading || isFetching ? (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-3xl text-[#ec1325]">progress_activity</span>
                                <span className="text-xs text-[#896165] font-semibold">Mencari data...</span>
                            </div>
                        </div>
                    ) : null}

                    {!searchName && !selectedBranch && !selectedGeneration ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                            <span className="material-symbols-outlined text-5xl mb-2 text-gray-300">manage_search</span>
                            <p className="text-sm font-medium">Masukkan nama atau pilih filter untuk memulai pencarian</p>
                            <p className="text-xs mt-1">Minimal 2 karakter pencarian nama untuk hasil yang optimal</p>
                        </div>
                    ) : !results || results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                            <span className="material-symbols-outlined text-5xl mb-2 text-gray-300">search_off</span>
                            <p className="text-sm font-medium">Data tidak ditemukan</p>
                            <p className="text-xs mt-1">Cobalah ubah filter pencarian Anda</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {results.map((person) => (
                                <button
                                    key={person.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(person)
                                        onClose()
                                    }}
                                    className="flex items-center justify-between p-4 bg-white border border-[#e6dbdc] rounded-xl hover:border-[#ec1325] hover:bg-red-50/10 text-left transition-all"
                                >
                                    <div className="min-w-0 pr-2">
                                        <p className="text-sm font-bold text-[#181112] truncate">{person.full_name}</p>
                                        <p className="text-xs text-[#896165] mt-1 flex items-center gap-1.5 flex-wrap">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-150 text-gray-700 font-medium">
                                                Gen {person.generation}
                                            </span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span>Qobilah: {person.branch?.name || '-'}</span>
                                        </p>
                                    </div>
                                    <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                                        person.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                                    }`}>
                                        {person.gender === 'male' ? 'male' : 'female'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#e6dbdc] bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-[#e6dbdc] rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    )
}
