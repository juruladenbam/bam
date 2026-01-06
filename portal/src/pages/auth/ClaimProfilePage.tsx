import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { silsilahApi } from '../../features/silsilah/api/silsilahApi'
import type { Person } from '../../features/silsilah/types'
import { useMe } from '../../features/silsilah/hooks/useSilsilah'

export function ClaimProfilePage() {
    const navigate = useNavigate()
    const { data, refetch } = useMe()
    const user = data?.user
    const refreshUser = refetch

    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Person[]>([])
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [loading, setLoading] = useState(false)
    const [claiming, setClaiming] = useState(false)
    const [error, setError] = useState('')
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    // Redirect if already has person_id? Maybe handled by AuthGuard or just here
    if (user?.person_id) {
        // navigate('/') // This might cause render loop if simplified. 
        // Better to just show message "Anda sudah terhubung"
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setError('')
        setResults([])
        setSelectedPerson(null)

        try {
            const data = await silsilahApi.search(query)
            setResults(data)
            if (data.length === 0) {
                setError('Data tidak ditemukan.')
            }
        } catch (err) {
            setError('Gagal mencari data.')
        } finally {
            setLoading(false)
        }
    }

    const handleClaimClick = () => {
        if (!selectedPerson) return
        setShowConfirmDialog(true)
    }

    const executeClaim = async () => {
        if (!selectedPerson) return

        setClaiming(true)
        try {
            await silsilahApi.claimPerson(selectedPerson.id)
            await refreshUser() // Update local user state
            navigate('/') // Go to dashboard
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menautkan data.')
            setShowConfirmDialog(false)
        } finally {
            setClaiming(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#f8f6f6]">
            <div className="max-w-xl w-full">
                <div className="text-center mb-8">
                    <div className="size-16 mx-auto rounded-full bg-[#ec1325]/10 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[#ec1325] text-3xl">link</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#181112]">Tautkan Data Diri</h1>
                    <p className="text-[#896165] mt-2">
                        Cari dan klaim data diri anda di silsilah keluarga
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-8 border border-[#e6dbdc]">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSearch} className="mb-6">
                        <label className="block text-sm font-medium text-[#181112] mb-1">
                            Cari Nama Anda
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 px-4 py-3 border border-[#e6dbdc] rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-transparent bg-[#f8f6f6] text-[#181112]"
                                placeholder="Masukkan nama..."
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#181112] text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition disabled:opacity-50"
                            >
                                {loading ? '...' : 'Cari'}
                            </button>
                        </div>
                    </form>

                    {results.length > 0 && !selectedPerson && (
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            <p className="text-sm text-[#896165] mb-2">Pilih data yang sesuai:</p>
                            {results.map((person) => (
                                <button
                                    key={person.id}
                                    onClick={() => setSelectedPerson(person)}
                                    className="w-full text-left p-3 rounded-lg border border-[#e6dbdc] hover:border-[#ec1325] hover:bg-red-50 transition flex items-center gap-3 group"
                                >
                                    <div className={`size-10 rounded-full flex items-center justify-center ${person.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <span className="material-symbols-outlined">
                                            {person.gender === 'female' ? 'female' : 'male'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-[#181112] group-hover:text-[#ec1325]">
                                            {person.full_name}
                                        </div>
                                        <div className="text-xs text-[#896165]">
                                            {person.birth_date || 'Tanggal lahir tidak ada'}
                                            {person.death_date && ` - ${person.death_date}`}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedPerson && (
                        <div className="bg-[#f8f6f6] p-4 rounded-lg border border-[#e6dbdc] mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`size-12 rounded-full flex items-center justify-center ${selectedPerson.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {selectedPerson.gender === 'female' ? 'female' : 'male'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#181112] text-lg">
                                            {selectedPerson.full_name}
                                        </div>
                                        <div className="text-sm text-[#896165]">
                                            {selectedPerson.birth_date || '-'}
                                            {selectedPerson.death_date ? ` s/d ${selectedPerson.death_date}` : ''}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPerson(null)}
                                    className="text-[#896165] hover:text-[#181112]"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleClaimClick}
                                    disabled={claiming}
                                    className="flex-1 bg-[#ec1325] text-white py-2 rounded-lg font-semibold hover:bg-[#c91020] transition disabled:opacity-50"
                                >
                                    Ya, Ini Saya
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-[#e6dbdc] pt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-[#896165] hover:text-[#181112] text-sm font-medium"
                        >
                            Lewati untuk sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && selectedPerson && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-4xl text-[#ec1325]">link</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#181112] mb-2">Konfirmasi Tautkan Data</h3>
                        <p className="text-[#896165] mb-6">
                            Apakah Anda yakin ingin menautkan akun Anda dengan data diri <strong>{selectedPerson.full_name}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={claiming}
                                className="flex-1 py-2.5 rounded-xl font-medium text-[#181112] bg-[#f8f6f6] hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeClaim}
                                disabled={claiming}
                                className="flex-1 py-2.5 rounded-xl font-medium bg-[#ec1325] text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {claiming ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                        Memproses...
                                    </>
                                ) : (
                                    'Ya, Tautkan'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
