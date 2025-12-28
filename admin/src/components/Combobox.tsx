import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'

interface Option {
    id: number | string
    label: string
    subLabel?: string
}

interface ComboboxProps {
    label: string
    placeholder?: string
    onSearch: (query: string) => void
    options: Option[]
    selectedId?: number | string
    onSelect: (option: Option | null) => void
    loading?: boolean
    helperText?: string
    onLoadMore?: () => void
    hasMore?: boolean
    initialLabel?: string
}

export function Combobox({
    label,
    placeholder,
    onSearch,
    options,
    selectedId,
    onSelect,
    loading = false,
    helperText,
    onLoadMore,
    hasMore,
    initialLabel
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [displayValue, setDisplayValue] = useState('')

    // Initial Display Value
    useEffect(() => {
        if (selectedId) {
            const found = options.find(o => o.id === selectedId)
            if (found) {
                setDisplayValue(found.label)
            } else if (initialLabel) {
                setDisplayValue(initialLabel)
            }
        } else {
            if (!isOpen) setDisplayValue('')
        }
    }, [selectedId, options, isOpen, initialLabel])

    // Search Debounce (only triggers onSearch)
    const debouncedSearch = useDebounce(query, 300)

    useEffect(() => {
        // Trigger search regardless of empty string (to allow resetting list)
        // Only if open (to prevent search on initial load unless desired)
        if (isOpen) {
            onSearch(debouncedSearch)
        }
    }, [debouncedSearch, isOpen])

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                // Restore display value if selection exists
                const found = options.find(o => o.id === selectedId)
                if (found) setDisplayValue(found.label)
                else if (!selectedId) setDisplayValue('')
                else {
                    // Keep current text if ID exists but not in list? Or clear?
                    // Better keep current text if ID exists (it might be a pre-fetched value not in current search list)
                    // But here we don't have that label stored if not in options.
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [selectedId, options])

    const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
        if (scrollHeight - scrollTop - clientHeight < 50) { // Threshold 50px
            if (!loading && hasMore && onLoadMore) {
                onLoadMore()
            }
        }
    }

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-[#181112] mb-1">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50 pr-10"
                    placeholder={placeholder || "Ketik untuk mencari..."}
                    value={isOpen ? query : displayValue}
                    onFocus={() => {
                        setIsOpen(true)
                        setQuery('') // Clear input to show full list? 
                        // UX: Usually user wants to see suggestions.
                        // Or keep current text to filter?
                        // Let's clear query for fresh search, but user can retype.
                        onSearch('') // Trigger empty search
                    }}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin text-gray-400 text-sm">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-gray-400 text-sm">search</span>
                    )}
                </div>
            </div>

            {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#e6dbdc] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.length > 0 ? (
                        <ul onScroll={handleScroll}>
                            {options.map((option) => (
                                <li
                                    key={option.id}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none ${selectedId === option.id ? 'bg-red-50' : ''}`}
                                    onClick={() => {
                                        onSelect(option)
                                        setIsOpen(false)
                                        setDisplayValue(option.label)
                                    }}
                                >
                                    <div className="font-medium text-[#181112]">{option.label}</div>
                                    {option.subLabel && (
                                        <div className="text-xs text-gray-500">{option.subLabel}</div>
                                    )}
                                </li>
                            ))}
                            {loading && (
                                <li className="px-4 py-2 text-center text-gray-400">
                                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                </li>
                            )}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            {loading ? "Mencari..." : "Tidak ditemukan"}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
