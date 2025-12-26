
import { useNavigate } from 'react-router-dom'
import type { Person } from '../types'
import { useRelationship } from '../hooks/useSilsilah'

interface MemberSidebarProps {
    person: Person | null
    isOpen: boolean
    onClose: () => void
}

export function MemberSidebar({ person, isOpen, onClose }: MemberSidebarProps) {
    const navigate = useNavigate()
    const { data: rel } = useRelationship(person ? person.id : 0)

    if (!person) return null

    const isDeceased = !person.is_alive
    const isLiving = person.is_alive

    return (
        <aside
            className={`
                fixed top-16 right-0 bottom-0 w-full md:w-96 bg-white border-l border-[#e6dbdc] shadow-2xl z-30 transition-transform duration-300 ease-in-out transform
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#f4f0f0]">
                    <h3 className="text-base font-bold text-[#181112]">Member Details</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-[#f8f6f6] text-[#896165] transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {/* Profile Card */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <div className="size-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 ring-4 ring-[#f8f6f6]">
                                {person.photo_url ? (
                                    <img
                                        src={person.photo_url}
                                        alt={person.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${person.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-500'}`}>
                                        {person.full_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {isLiving && (
                                <div className="absolute bottom-1 right-1 size-6 bg-green-500 rounded-full border-2 border-white" title="Living" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-center text-[#181112] mb-1 leading-tight">
                            {person.full_name}
                        </h2>
                        <p className="text-sm text-[#896165] mb-4">
                            Generation {person.generation}
                        </p>

                        <div className="flex gap-2 w-full">
                            <button
                                onClick={() => navigate(`/silsilah/person/${person.id}`)}
                                className="flex-1 bg-[#ec1325] hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
                            >
                                View full Profile
                            </button>
                            <button className="bg-[#f8f6f6] hover:bg-[#e6dbdc] text-[#181112] p-2.5 rounded-lg transition-colors border border-transparent">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                        </div>
                    </div>

                    {/* Info Blocks */}
                    <div className="space-y-6">
                        {/* Relationship Info */}
                        {rel && (
                            <div>
                                <h4 className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-3">Hubungan Keluarga</h4>
                                <div className="bg-[#fff0f0] rounded-xl p-4 border border-[#e6dbdc]">
                                    <div className="flex items-start gap-3">
                                        <div className="size-10 rounded-full bg-[#ec1325]/10 flex items-center justify-center text-[#ec1325] shrink-0">
                                            <span className="material-symbols-outlined">diversity_3</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="font-bold text-[#ec1325] text-lg leading-none">
                                                    {rel.label}
                                                </h5>
                                                {rel.label_javanese && (
                                                    <span className="bg-[#ec1325] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                                        {rel.label_javanese}
                                                    </span>
                                                )}
                                            </div>
                                            {rel.sapaan && (
                                                <div className="mb-2 text-sm text-[#181112] bg-white/50 px-2 py-1 rounded border border-red-100 inline-block">
                                                    <span className="font-semibold text-[#896165] text-xs uppercase mr-1">Panggil:</span>
                                                    <span className="font-medium text-[#ec1325]">{rel.sapaan}</span>
                                                </div>
                                            )}
                                            <p className="text-xs text-[#896165] leading-relaxed">
                                                {rel.path?.description || 'Hubungan belum terdefinisi secara detail.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vital Info */}
                        <div>
                            <h4 className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-3">Vital Information</h4>
                            <div className="bg-[#f8f6f6] rounded-xl p-4 space-y-3">
                                {/* Birth */}
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[#896165] text-[20px] mt-0.5">cake</span>
                                    <div>
                                        <p className="text-xs text-[#896165]">Birth</p>
                                        <p className="text-sm font-medium text-[#181112]">
                                            {person.birth_date || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                                {/* Death if deceased */}
                                {isDeceased && (
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#896165] text-[20px] mt-0.5">church</span>
                                        <div>
                                            <p className="text-xs text-[#896165]">Death</p>
                                            <p className="text-sm font-medium text-[#181112]">
                                                {person.death_date || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Gender */}
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[#896165] text-[20px] mt-0.5">wc</span>
                                    <div>
                                        <p className="text-xs text-[#896165]">Gender</p>
                                        <p className="text-sm font-medium text-[#181112] capitalize">
                                            {person.gender}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
