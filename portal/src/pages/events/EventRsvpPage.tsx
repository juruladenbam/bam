import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { contentApi } from '../../features/content/api/contentApi'
import { RsvpForm } from '../../features/rsvp'

export function EventRsvpPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const isMobile = useIsMobile()

    const { data: eventData, isLoading: eventLoading } = useQuery({
        queryKey: ['portal', 'event', slug],
        queryFn: () => contentApi.getEvent(slug as string),
        enabled: !!slug
    })

    const event = eventData as any

    if (eventLoading) {
        return (
            <MobileLayout>
                <div className="flex-1 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#ec1325]">progress_activity</span>
                </div>
            </MobileLayout>
        )
    }

    if (!event) {
        return (
            <MobileLayout>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_busy</span>
                    <h1 className="text-2xl font-bold text-[#181112]">Acara Tidak Ditemukan</h1>
                    <Link to="/events" className="mt-4 text-[#ec1325] hover:underline">Kembali ke Daftar Acara</Link>
                </div>
            </MobileLayout>
        )
    }

    return (
        <MobileLayout>
            {/* Mobile back button */}
            {isMobile && (
                <div
                    className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#e6dbdc]"
                    style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-[#896165] hover:text-[#ec1325] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Kembali
                    </button>
                </div>
            )}

            <div className="flex-1 w-full max-w-[640px] mx-auto px-4 pb-20">
                {/* Desktop Back Button */}
                {!isMobile && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-8 mb-4 flex items-center gap-1 text-sm font-medium text-[#896165] hover:text-[#ec1325] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Kembali
                    </button>
                )}

                {/* Banner/Header */}
                <div className="mt-4 text-center space-y-2 mb-6">
                    <span className="inline-block px-3 py-1 bg-red-50 text-[#ec1325] text-xs font-bold rounded-full tracking-wider uppercase border border-[#ec1325]/10">
                        Konfirmasi Kehadiran
                    </span>
                    <h1 className="text-2xl font-black text-[#181112] tracking-tight">
                        {event.name}
                    </h1>
                    <p className="text-[#896165] font-medium text-xs sm:text-sm">
                        Keluarga Besar Bani Abdul Manan (BAM)
                    </p>
                </div>

                {/* Event info card */}
                <div className="bg-white border border-[#e6dbdc] rounded-2xl p-5 shadow-sm mb-6 flex flex-col gap-4">
                    <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-[#ec1325] mt-0.5">location_on</span>
                        <div>
                            <p className="font-bold text-[#181112] text-sm sm:text-base">Lokasi Acara</p>
                            {event.location_maps_url ? (
                                <a
                                    href={event.location_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#ec1325] hover:underline text-xs sm:text-sm font-medium"
                                >
                                    {event.location_name}
                                </a>
                            ) : (
                                <p className="text-gray-600 text-xs sm:text-sm">{event.location_name}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-[#ec1325] mt-0.5">calendar_today</span>
                        <div>
                            <p className="font-bold text-[#181112] text-sm sm:text-base">Tanggal Pelaksanaan</p>
                            <p className="text-gray-600 text-xs sm:text-sm">
                                {new Date(event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {event.end_date && ` — ${new Date(event.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RSVP Form */}
                <RsvpForm eventIdOrSlug={event.slug || event.id} />
            </div>
        </MobileLayout>
    )
}
