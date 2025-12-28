import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCreateMarriage, useUpdateMarriage, useMarriage } from '../../features/admin/hooks/useAdmin'
import { adminApi } from '../../features/admin/api/adminApi'
import type { CreateMarriageData, Person } from '../../types'

interface ValidationErrors {
    [key: string]: string[]
}

function PersonSearch({
    label,
    placeholder,
    gender,
    value,
    onChange,
    error
}: {
    label: string
    placeholder: string
    gender: 'male' | 'female'
    value: Person | null
    onChange: (person: Person | null) => void
    error?: string
}) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [persons, setPersons] = useState<Person[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [offset, setOffset] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const LIMIT = 10

    // Search on query change
    useEffect(() => {
        if (query.length < 2) {
            setPersons([])
            setHasMore(false)
            setOffset(0)
            return
        }

        const searchTimer = setTimeout(async () => {
            setIsLoading(true)
            setOffset(0)
            try {
                const result = await adminApi.searchPersons(query, LIMIT, 0)
                const filtered = (result.data?.data || []).filter(p => p.gender === gender)
                setPersons(filtered)
                setHasMore(result.data?.has_more || false)
                setOffset(LIMIT)
            } catch (err) {
                console.error('Search error:', err)
                setPersons([])
            } finally {
                setIsLoading(false)
            }
        }, 300) // Debounce

        return () => clearTimeout(searchTimer)
    }, [query, gender])

    // Load more on scroll
    const handleScroll = useCallback(async () => {
        const dropdown = dropdownRef.current
        if (!dropdown || isLoadingMore || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = dropdown
        if (scrollTop + clientHeight >= scrollHeight - 20) {
            setIsLoadingMore(true)
            try {
                const result = await adminApi.searchPersons(query, LIMIT, offset)
                const filtered = (result.data?.data || []).filter(p => p.gender === gender)
                setPersons(prev => [...prev, ...filtered])
                setHasMore(result.data?.has_more || false)
                setOffset(prev => prev + LIMIT)
            } catch (err) {
                console.error('Load more error:', err)
            } finally {
                setIsLoadingMore(false)
            }
        }
    }, [query, gender, offset, hasMore, isLoadingMore])

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (person: Person) => {
        onChange(person)
        setQuery('')
        setIsOpen(false)
        setPersons([])
    }

    const handleClear = () => {
        onChange(null)
        setQuery('')
        setPersons([])
    }

    return (
        <div ref={containerRef} className="relative">
            <label className="block text-sm font-medium text-[#181112] mb-1">{label} *</label>

            {value ? (
                <div className="flex items-center gap-2 px-4 py-2 border border-[#e6dbdc] rounded-lg bg-[#f8f6f6]">
                    <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                        }`}>
                        {value.full_name.charAt(0)}
                    </div>
                    <span className="flex-1 text-[#181112]">{value.full_name}</span>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-[#896165] hover:text-red-500"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            ) : (
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#ec1325]/50 ${error ? 'border-red-300' : 'border-[#e6dbdc]'
                        }`}
                    placeholder={placeholder}
                />
            )}

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {/* Dropdown */}
            {isOpen && !value && query.length >= 2 && (
                <div
                    ref={dropdownRef}
                    onScroll={handleScroll}
                    className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e6dbdc] rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                    {isLoading ? (
                        <div className="px-4 py-3 text-center text-[#896165]">
                            <span className="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
                            Mencari...
                        </div>
                    ) : persons.length === 0 ? (
                        <div className="px-4 py-3 text-center text-[#896165]">
                            Tidak ditemukan
                        </div>
                    ) : (
                        <>
                            {persons.map((person) => (
                                <button
                                    key={person.id}
                                    type="button"
                                    onClick={() => handleSelect(person)}
                                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#f8f6f6] text-left"
                                >
                                    <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                        }`}>
                                        {person.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#181112]">{person.full_name}</p>
                                        <p className="text-xs text-[#896165]">{person.branch?.name || 'Tidak ada qobilah'}</p>
                                    </div>
                                </button>
                            ))}
                            {isLoadingMore && (
                                <div className="px-4 py-2 text-center text-[#896165] border-t border-[#e6dbdc]">
                                    <span className="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
                                    Memuat...
                                </div>
                            )}
                            {!isLoadingMore && hasMore && (
                                <div className="px-4 py-2 text-center text-xs text-[#896165] border-t border-[#e6dbdc]">
                                    Scroll untuk muat lebih banyak
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export function MarriageFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    const { data: marriageData, isLoading: isLoadingMarriage } = useMarriage(Number(id))
    const createMarriage = useCreateMarriage()
    const updateMarriage = useUpdateMarriage()

    const [husband, setHusband] = useState<Person | null>(null)
    const [wife, setWife] = useState<Person | null>(null)
    const [marriageDate, setMarriageDate] = useState('')
    const [marriageLocation, setMarriageLocation] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [generalError, setGeneralError] = useState('')

    // Populate form when editing
    useEffect(() => {
        if (marriageData?.data) {
            const marriage = marriageData.data
            if (marriage.husband) setHusband(marriage.husband)
            if (marriage.wife) setWife(marriage.wife)
            setMarriageDate(marriage.marriage_date || '')
            setMarriageLocation(marriage.marriage_location || '')
            setIsActive(marriage.is_active)
        }
    }, [marriageData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setGeneralError('')

        if (!husband || !wife) {
            setGeneralError('Pilih suami dan istri terlebih dahulu')
            return
        }

        const data: CreateMarriageData = {
            husband_id: husband.id,
            wife_id: wife.id,
            marriage_date: marriageDate || undefined,
            marriage_location: marriageLocation || undefined,
            is_active: isActive,
        }

        try {
            if (isEdit) {
                await updateMarriage.mutateAsync({ id: Number(id), data })
            } else {
                await createMarriage.mutateAsync(data)
            }
            navigate('/marriages')
        } catch (error: unknown) {
            console.error('Error saving marriage:', error)
            const err = error as { errors?: ValidationErrors; message?: string }
            if (err.errors) {
                setErrors(err.errors)
            } else if (err.message) {
                setGeneralError(err.message)
            } else {
                setGeneralError('Gagal menyimpan data. Silakan coba lagi.')
            }
        }
    }

    const isPending = createMarriage.isPending || updateMarriage.isPending

    if (isEdit && isLoadingMarriage) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#ec1325]">progress_activity</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/marriages" className="p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[#896165]">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">
                        {isEdit ? 'Edit Pernikahan' : 'Tambah Pernikahan Baru'}
                    </h1>
                    <p className="text-sm text-[#896165]">
                        {isEdit ? 'Perbarui data pernikahan' : 'Masukkan data pernikahan baru'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e6dbdc] p-6 space-y-6">
                {/* Error Banner */}
                {(generalError || Object.keys(errors).length > 0) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <div>
                                <p className="font-medium text-red-700">
                                    {generalError || 'Terdapat kesalahan validasi:'}
                                </p>
                                {Object.keys(errors).length > 0 && (
                                    <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                                        {Object.entries(errors).map(([field, messages]) => (
                                            <li key={field}>{messages[0]}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pasangan */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Pasangan</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PersonSearch
                            label="Suami"
                            placeholder="Cari nama suami..."
                            gender="male"
                            value={husband}
                            onChange={setHusband}
                            error={errors.husband_id?.[0]}
                        />
                        <PersonSearch
                            label="Istri"
                            placeholder="Cari nama istri..."
                            gender="female"
                            value={wife}
                            onChange={setWife}
                            error={errors.wife_id?.[0]}
                        />
                    </div>

                    {/* Internal Marriage Indicator */}
                    {husband && wife && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${(husband.branch?.order ?? 99) < 99 && (wife.branch?.order ?? 99) < 99
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-50 text-gray-600'
                            }`}>
                            <span className="material-symbols-outlined text-[18px]">info</span>
                            {(husband.branch?.order ?? 99) < 99 && (wife.branch?.order ?? 99) < 99
                                ? 'Pernikahan internal (kedua pasangan keturunan BAM)'
                                : 'Pernikahan eksternal (salah satu pasangan dari luar)'}
                        </div>
                    )}
                </div>

                {/* Detail */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Detail Pernikahan</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Nikah</label>
                            <input
                                type="date"
                                value={marriageDate}
                                onChange={(e) => setMarriageDate(e.target.value)}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Lokasi</label>
                            <input
                                type="text"
                                value={marriageLocation}
                                onChange={(e) => setMarriageLocation(e.target.value)}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Lokasi pernikahan"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="accent-[#ec1325]"
                        />
                        <label htmlFor="is_active" className="text-sm text-[#181112]">Pernikahan masih aktif</label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6dbdc]">
                    <Link
                        to="/marriages"
                        className="px-4 py-2 border border-[#e6dbdc] rounded-lg text-[#181112] font-medium hover:bg-[#f8f6f6] transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isPending && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Pernikahan'}
                    </button>
                </div>
            </form>
        </div>
    )
}
