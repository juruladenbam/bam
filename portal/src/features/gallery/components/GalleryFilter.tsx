interface GalleryFilterProps {
    selectedType?: 'image' | 'video'
    selectedYear?: number
    years?: number[]
    onTypeChange: (type?: 'image' | 'video') => void
    onYearChange: (year?: number) => void
}

export function GalleryFilter({
    selectedType,
    selectedYear,
    years = [],
    onTypeChange,
    onYearChange,
}: GalleryFilterProps) {
    return (
        <div className="flex flex-wrap gap-4 items-center mb-6">
            {/* Type Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => onTypeChange(undefined)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedType
                            ? 'bg-[#ec1325] text-white'
                            : 'bg-white border border-[#e6dbdc] text-[#181112] hover:border-[#ec1325]'
                        }`}
                >
                    Semua
                </button>
                <button
                    onClick={() => onTypeChange('image')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedType === 'image'
                            ? 'bg-[#ec1325] text-white'
                            : 'bg-white border border-[#e6dbdc] text-[#181112] hover:border-[#ec1325]'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">photo</span>
                    Foto
                </button>
                <button
                    onClick={() => onTypeChange('video')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedType === 'video'
                            ? 'bg-[#ec1325] text-white'
                            : 'bg-white border border-[#e6dbdc] text-[#181112] hover:border-[#ec1325]'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">videocam</span>
                    Video
                </button>
            </div>

            {/* Year Filter */}
            {years.length > 0 && (
                <select
                    value={selectedYear || ''}
                    onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : undefined)}
                    className="px-4 py-2 rounded-lg border border-[#e6dbdc] text-sm text-[#181112] bg-white focus:border-[#ec1325] focus:ring-1 focus:ring-[#ec1325] outline-none"
                >
                    <option value="">Semua Tahun</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            )}
        </div>
    )
}

export default GalleryFilter
