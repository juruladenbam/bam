import { useSearchPersonsAdvanced } from '../hooks/useRsvp'
import type { Person } from '../../silsilah/types'

interface PersonSuggestionsProps {
    searchName: string;
    selectedPerson: Person | null;
    onSelect: (person: Person) => void;
    onOpenSearchModal: () => void;
}

export function PersonSuggestions({
    searchName,
    selectedPerson,
    onSelect,
    onOpenSearchModal
}: PersonSuggestionsProps) {
    const { data: suggestions, isLoading } = useSearchPersonsAdvanced({ q: searchName })

    if (!searchName) return null;

    return (
        <div className="mt-4 p-4 bg-gray-50 border border-[#e6dbdc] rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[#181112] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#ec1325]">explore</span>
                    Saran Pencocokan Otomatis
                </h4>
                <button
                    type="button"
                    onClick={onOpenSearchModal}
                    className="text-xs font-bold text-[#ec1325] hover:underline flex items-center gap-0.5"
                >
                    <span className="material-symbols-outlined text-[14px]">search</span>
                    Cari Komprehensif
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-4">
                    <span className="material-symbols-outlined animate-spin text-2xl text-[#ec1325]">progress_activity</span>
                </div>
            ) : !suggestions || suggestions.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-xs text-gray-500 italic mb-2">Tidak ada saran otomatis yang cocok.</p>
                    <button
                        type="button"
                        onClick={onOpenSearchModal}
                        className="px-3 py-1.5 bg-white border border-[#e6dbdc] rounded-lg text-xs font-semibold text-[#181112] hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">search</span>
                        Cari Person Manual
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((person) => {
                        const isSelected = selectedPerson?.id === person.id;
                        return (
                            <button
                                key={person.id}
                                type="button"
                                onClick={() => onSelect(person)}
                                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                                    isSelected
                                        ? 'bg-red-50/50 border-[#ec1325] ring-1 ring-[#ec1325]'
                                        : 'bg-white border-[#e6dbdc] hover:border-gray-300'
                                }`}
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="text-sm font-bold text-[#181112] truncate">{person.full_name}</p>
                                    <p className="text-xs text-[#896165] mt-0.5 flex items-center gap-1.5">
                                        <span>Qobilah: {person.branch?.name || '-'}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span>Gen {person.generation}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`material-symbols-outlined text-[18px] ${
                                        person.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
                                    }`}>
                                        {person.gender === 'male' ? 'male' : 'female'}
                                    </span>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-[#ec1325] text-[18px] font-bold">
                                            check_circle
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
