import { useState, useEffect } from 'react'
import { silsilahApi } from '../../features/silsilah/api/silsilahApi'
import { useDebounce } from '../../hooks/useDebounce'
import type { Person } from '../../features/silsilah/types'

interface PersonPickerProps {
    value?: Person | null
    onChange: (person: Person | null) => void
    label?: string
    placeholder?: string
    required?: boolean
    error?: string
}

export function PersonPicker({
    value,
    onChange,
    label = "Pilih Anggota",
    placeholder = "Cari nama...",
    required = false,
    error
}: PersonPickerProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Person[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const debouncedQuery = useDebounce(query, 300)

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setResults([])
            return
        }

        const search = async () => {
            setIsSearching(true)
            try {
                const data = await silsilahApi.search(debouncedQuery)
                setResults(data)
                setShowResults(true)
            } catch (err) {
                console.error('Search failed:', err)
            } finally {
                setIsSearching(false)
            }
        }

        search()
    }, [debouncedQuery])

    const handleSelect = (person: Person) => {
        onChange(person)
        setQuery('')
        setShowResults(false)
    }

    const handleClear = () => {
        onChange(null)
        setQuery('')
    }

    if (value) {
        return (
            <div>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className={`flex items-center gap-3 p-3 bg-blue-50 border rounded-lg ${error ? 'border-red-300' : 'border-blue-100'}`}>
                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${value.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                        {value.photo_url ? (
                            <img src={value.photo_url} alt={value.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="font-bold">{value.full_name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{value.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">
                            {value.branch ? `Qobilah ${value.branch.name.replace('Qobilah ', '')}` : 'Tidak ada qobilah'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 hover:bg-blue-100 rounded text-gray-400 hover:text-gray-600"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        )
    }

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setShowResults(true)
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] ${error ? 'border-red-300' : 'border-gray-300'}`}
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
                    search
                </span>
                {isSearching && (
                    <div className="absolute right-3 top-2.5">
                        <span className="block size-4 border-2 border-[#ec1325]/30 border-t-[#ec1325] rounded-full animate-spin"></span>
                    </div>
                )}
            </div>

            {showResults && query.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {results.length > 0 ? (
                        results.map((person) => (
                            <button
                                key={person.id}
                                type="button"
                                onClick={() => handleSelect(person)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                            >
                                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${person.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                    <span className="text-xs font-bold">{person.full_name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{person.full_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {person.branch ? person.branch.name : '-'}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        !isSearching && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Tidak ditemukan
                            </div>
                        )
                    )}
                </div>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    )
}
