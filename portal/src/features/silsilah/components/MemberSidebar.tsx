
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Person } from '../types'
import { useRelationship } from '../hooks/useSilsilah'

interface MemberSidebarProps {
    person: Person | null
    isOpen: boolean
    onClose: () => void
    isMobile?: boolean
}

import { ShareModal } from './ShareModal'

export function MemberSidebar({ person, isOpen, onClose, isMobile = false }: MemberSidebarProps) {
    const navigate = useNavigate()
    const { data: rel } = useRelationship(person ? person.id : 0)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)

    // Helper for date formatting
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Unknown'
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    // Bottom sheet state for mobile
    const [sheetHeight, setSheetHeight] = useState(40) // percentage of screen
    const [isDragging, setIsDragging] = useState(false)
    const dragStartY = useRef(0)
    const startHeight = useRef(40)

    useEffect(() => {
        if (isOpen && isMobile) {
            setSheetHeight(40) // Reset to default when opening
        }
    }, [isOpen, isMobile])

    const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true)
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
        dragStartY.current = clientY
        startHeight.current = sheetHeight
    }

    const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
        const delta = dragStartY.current - clientY
        const deltaPercent = (delta / window.innerHeight) * 100
        const newHeight = Math.min(95, Math.max(20, startHeight.current + deltaPercent))
        setSheetHeight(newHeight)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
        // Snap to positions
        if (sheetHeight < 30) {
            onClose()
        } else if (sheetHeight > 70) {
            setSheetHeight(95) // Full screen
        } else {
            setSheetHeight(40) // Default
        }
    }

    if (!person) return null

    const isDeceased = !person.is_alive
    const isLiving = person.is_alive

    // Mobile bottom sheet
    if (isMobile) {
        return (
            <>
                {/* Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                        onClick={onClose}
                    />
                )}

                {/* Bottom Sheet */}
                <div
                    className={`
                        fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50
                        transform transition-transform duration-300 ease-out
                        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                    `}
                    style={{ height: `${sheetHeight}vh` }}
                >
                    {/* Drag Handle */}
                    <div
                        className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                    >
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pb-3 border-b border-[#f4f0f0]">
                        <h3 className="text-base font-bold text-[#181112]">Member Details</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded hover:bg-[#f8f6f6] text-[#896165] transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin" style={{ height: 'calc(100% - 80px)' }}>
                        {/* Profile Card */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-3">
                                <div className="size-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 ring-4 ring-[#f8f6f6]">
                                    {person.photo_url ? (
                                        <img
                                            src={person.photo_url}
                                            alt={person.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${person.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-500'}`}>
                                            {person.full_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {isLiving && (
                                    <div className="absolute bottom-0 right-0 size-5 bg-green-500 rounded-full border-2 border-white" title="Living" />
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-center text-[#181112] mb-0.5">{person.full_name}</h2>
                            <p className="text-xs text-[#896165] mb-3">Generation {person.generation}</p>

                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => navigate(`/silsilah/person/${person.id}`)}
                                    className="flex-1 bg-[#ec1325] hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                                >
                                    View full Profile
                                </button>
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="bg-[#f8f6f6] hover:bg-[#e6dbdc] text-[#181112] p-2.5 rounded-lg transition-colors border border-transparent"
                                >
                                    <span className="material-symbols-outlined text-[20px]">share</span>
                                </button>
                            </div>
                            <button
                                onClick={() => navigate('/submissions', { state: { preselectedPerson: person } })}
                                className="w-full mt-2 bg-white border border-[#ec1325] text-[#ec1325] hover:bg-red-50 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                Lapor Data
                            </button>
                        </div>

                        {/* Relationship Info */}
                        {rel && (
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-2">Hubungan Keluarga</h4>
                                <div className="bg-[#fff0f0] rounded-xl p-3 border border-[#e6dbdc]">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-[#ec1325]/10 flex items-center justify-center text-[#ec1325]">
                                            <span className="material-symbols-outlined text-[18px]">diversity_3</span>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-[#ec1325] text-sm">{rel.label}</h5>
                                            {rel.sapaan && (
                                                <p className="text-xs text-[#896165]">Panggil: {rel.sapaan}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Vital Info */}
                        <div>
                            <h4 className="text-xs font-bold text-[#896165] uppercase tracking-wider mb-2">Vital Information</h4>
                            <div className="bg-[#f8f6f6] rounded-xl p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#896165] text-[18px]">cake</span>
                                    <div>
                                        <p className="text-xs text-[#896165]">Birth</p>
                                        <p className="text-sm font-medium text-[#181112]">{formatDate(person.birth_date)}</p>
                                    </div>
                                </div>
                                {isDeceased && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#896165] text-[18px]">church</span>
                                        <div>
                                            <p className="text-xs text-[#896165]">Death</p>
                                            <p className="text-sm font-medium text-[#181112]">{formatDate(person.death_date)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <ShareModal
                    person={person}
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                />
            </>
        )
    }

    // Desktop: Slide from right (existing behavior)
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

                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => navigate(`/silsilah/person/${person.id}`)}
                                    className="flex-1 bg-[#ec1325] hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
                                >
                                    View full Profile
                                </button>
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="bg-[#f8f6f6] hover:bg-[#e6dbdc] text-[#181112] p-2.5 rounded-lg transition-colors border border-transparent"
                                >
                                    <span className="material-symbols-outlined text-[20px]">share</span>
                                </button>
                            </div>
                            <button
                                onClick={() => navigate('/submissions', { state: { preselectedPerson: person } })}
                                className="w-full bg-white border border-[#ec1325] text-[#ec1325] hover:bg-red-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                Lapor Data (Kelahiran/Pernikahan/dll)
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
                                        <p className="text-js font-medium text-[#181112]">
                                            {formatDate(person.birth_date)}
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
                                                {formatDate(person.death_date)}
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
            {
                person && (
                    <ShareModal
                        person={person}
                        isOpen={isShareModalOpen}
                        onClose={() => setIsShareModalOpen(false)}
                    />
                )
            }
        </aside>
    )
}
