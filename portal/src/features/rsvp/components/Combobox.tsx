import { useState, useRef, useEffect } from 'react';

interface ComboboxOption {
    id: number;
    name: string;
    description?: string | null;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
    noOptionsMessage?: string;
    label?: string;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Pilih peserta...',
    noOptionsMessage = 'Nama tidak ditemukan',
    label,
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    // Filter options based on query
    const filteredOptions = search.trim() === ''
        ? options
        : options.filter((opt) =>
            opt.name.toLowerCase().includes(search.toLowerCase())
          );

    // Sync input field value when selected option changes
    useEffect(() => {
        if (selectedOption) {
            setSearch(selectedOption.name);
        } else {
            setSearch('');
        }
    }, [selectedOption]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset input to selected name if we clicked away
                if (selectedOption) {
                    setSearch(selectedOption.name);
                } else {
                    setSearch('');
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOption]);

    const handleSelect = (option: ComboboxOption) => {
        onChange(option.id);
        setSearch(option.name);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setSearch('');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-semibold text-[#181112] mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-white border border-[#e6dbdc] rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec1325]/10 focus:border-[#ec1325] transition-all pr-10 shadow-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#896165]">
                    {search && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 hover:bg-gray-150 rounded-full transition-colors flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-[#e6dbdc] rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-50 focus:outline-none py-1 scrollbar-thin scrollbar-thumb-gray-200">
                    {filteredOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                            {noOptionsMessage}
                        </div>
                    ) : (
                        filteredOptions.map((option) => {
                            const isSelected = option.id === value;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex flex-col transition-colors ${
                                        isSelected
                                            ? 'bg-red-50 text-[#ec1325] font-semibold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{option.name}</span>
                                    {option.description && (
                                        <span className="text-xs text-gray-400 font-normal mt-0.5">
                                            {option.description}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
