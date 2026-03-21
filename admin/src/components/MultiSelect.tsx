import { useState, useRef, useEffect } from 'react'

interface Option {
    id: number
    name: string
}

interface MultiSelectProps {
    label: string
    options: Option[]
    selected: number[]
    onChange: (ids: number[]) => void
}

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleOption = (id: number) => {
        const next = selected.includes(id)
            ? selected.filter(x => x !== id)
            : [...selected, id]
        onChange(next)
    }

    const selectedNames = options
        .filter(opt => selected.includes(opt.id))
        .map(opt => opt.name)

    return (
        <div className="relative min-w-48" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white text-sm focus:outline-none focus:border-[#ec1325]/50"
            >
                <span className="truncate max-w-[150px]">
                    {selected.length === 0 
                        ? label 
                        : selected.length === options.length
                        ? `Semua ${label}`
                        : selectedNames.join(', ')}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#896165] transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-[#e6dbdc] rounded-lg shadow-lg py-1">
                    <div 
                        className="px-4 py-2 text-xs font-semibold text-[#896165] border-b border-[#f8f6f6] flex justify-between items-center bg-[#f8f6f6]/50"
                    >
                        <span>{label}</span>
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => onChange(options.map(o => o.id))}
                                className="text-[#ec1325] hover:underline"
                            >
                                Semua
                            </button>
                            <button 
                                type="button"
                                onClick={() => onChange([])}
                                className="text-[#896165] hover:underline"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    {options.map(option => (
                        <label
                            key={option.id}
                            className="flex items-center px-4 py-2 hover:bg-[#f8f6f6] cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option.id)}
                                onChange={() => toggleOption(option.id)}
                                className="rounded border-[#e6dbdc] text-[#ec1325] focus:ring-[#ec1325] size-4 mr-3"
                            />
                            <span className="text-sm text-[#181112]">{option.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    )
}
