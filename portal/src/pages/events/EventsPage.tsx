import { useQuery } from '@tanstack/react-query'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { contentApi } from '../../features/content/api/contentApi'
import type { EventItem } from '../../features/content/api/contentApi'
import { EventCard } from '../../features/events/components/EventCard'

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function EventsPage() {
    const { data: upcomingEvents, isLoading: loadingUpcoming } = useQuery({
        queryKey: ['portal', 'events', 'upcoming'],
        queryFn: () => contentApi.getEvents('upcoming')
    })

    const { data: pastEvents } = useQuery({
        queryKey: ['portal', 'events', 'past'],
        queryFn: () => contentApi.getEvents('past')
    })


    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            <PortalHeader />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#181112] mb-2 tracking-tight">
                        Acara Keluarga
                    </h1>
                    <p className="text-[#896165] max-w-2xl">
                        Jadwal acara dan kegiatan keluarga besar Bani Abdul Manan. Jangan lewatkan momen berharga bersama keluarga.
                    </p>
                </div>

                {/* Upcoming Events */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-[#181112] mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ec1325]">event</span>
                        Acara Mendatang
                    </h2>

                    {loadingUpcoming ? (
                        <div className="text-center py-8 text-gray-500">Memuat acara...</div>
                    ) : (upcomingEvents || []).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents?.map((event: EventItem) => (
                                <EventCard key={event.id} event={event as any} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-[#e6dbdc] rounded-xl p-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-[#e6dbdc] mb-2">event_busy</span>
                            <p className="text-[#896165]">Belum ada acara mendatang</p>
                        </div>
                    )}
                </div>

                {/* Past Events */}
                {(pastEvents || []).length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-[#181112] mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400">history</span>
                            Acara Sebelumnya
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                            {pastEvents?.map((event: any) => (
                                <div
                                    key={event.id}
                                    className="bg-white border border-[#e6dbdc] rounded-xl p-5"
                                >
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        {formatDate(event.start_date)}
                                    </div>
                                    <h3 className="font-bold text-lg text-[#181112] mb-1">{event.name}</h3>
                                    <p className="text-sm text-[#896165]">{event.location_name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Coming Soon Notice */}
                <div className="mt-12 bg-gradient-to-r from-[#ec1325]/5 to-transparent border border-[#ec1325]/10 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-full bg-[#ec1325]/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#ec1325]">construction</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#181112] mb-1">Fitur Dalam Pengembangan</h3>
                            <p className="text-sm text-[#896165]">
                                Halaman ini masih dalam tahap pengembangan. Nantinya akan tersedia fitur pendaftaran acara,
                                notifikasi pengingat, dan galeri dokumentasi kegiatan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
