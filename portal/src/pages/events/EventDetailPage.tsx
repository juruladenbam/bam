import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { contentApi } from '../../features/content/api/contentApi'

export function EventDetailPage() {
    const { id } = useParams()

    const { data: eventData, isLoading } = useQuery({
        queryKey: ['portal', 'event', id],
        queryFn: () => contentApi.getEvent(Number(id)),
        enabled: !!id
    })

    const event = eventData as any

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
                <PortalHeader />
                <div className="flex-1 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#ec1325]">progress_activity</span>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
                <PortalHeader />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_busy</span>
                    <h1 className="text-2xl font-bold text-[#181112]">Acara Tidak Ditemukan</h1>
                    <Link to="/events" className="mt-4 text-[#ec1325] hover:underline">Kembali ke Daftar Acara</Link>
                </div>
            </div>
        )
    }



    // Group schedules by day
    const schedules = event.schedules || []
    const groupedSchedules = schedules.reduce((acc: any, curr: any) => {
        const day = curr.day_sequence
        if (!acc[day]) acc[day] = []
        acc[day].push(curr)
        return acc
    }, {})

    // Helper to get date for day sequence
    const getDayDate = (daySeq: number) => {
        const date = new Date(event.start_date)
        date.setDate(date.getDate() + (daySeq - 1))
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col font-display">
            <PortalHeader />

            <div className="flex-1 w-full max-w-[960px] mx-auto px-4 md:px-0 pb-20">

                {/* Hero Section */}
                <div
                    className="mt-8 rounded-xl overflow-hidden shadow-lg relative bg-[#181112]"
                    style={{
                        backgroundImage: event.thumbnail_url ? `url(${event.thumbnail_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="min-h-[400px] flex flex-col gap-6 items-center justify-center p-8 text-center relative z-10">
                        {/* Background Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-[-1]" />

                        <div className="flex flex-col gap-3">
                            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 self-center">
                                <span className="material-symbols-outlined text-white text-[18px]">calendar_month</span>
                                <span className="text-white text-xs font-bold uppercase tracking-wider">
                                    {new Date(event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(event.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
                                {event.name}
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-white/90">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                                <span className="font-medium">{event.location_name}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            {event.location_maps_url && (
                                <a
                                    href={event.location_maps_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-12 items-center justify-center rounded-lg px-8 bg-[#ec1325] text-white text-base font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 gap-2"
                                >
                                    <span className="material-symbols-outlined">map</span>
                                    Lihat Lokasi
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description */}
                        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#e6dbdc]">
                            <h2 className="text-2xl font-bold text-[#181112] mb-4">Tentang Acara</h2>
                            <div
                                className="prose prose-sm max-w-none text-gray-600 [&>p]:mb-4"
                                dangerouslySetInnerHTML={{ __html: event.description }}
                            />
                        </section>

                        {/* Rundown / Schedule */}
                        {schedules.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 px-4 pb-6 pt-2">
                                    <div className="p-3 bg-red-50 rounded-lg text-[#ec1325]">
                                        <span className="material-symbols-outlined text-[28px]">schedule</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold leading-tight text-[#181112]">Susunan Acara</h2>
                                        <p className="text-sm text-[#896165]">Rangkaian kegiatan {event.name}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#e6dbdc]">
                                    <div className="grid grid-cols-[40px_1fr] gap-x-4 sm:gap-x-6">
                                        {Object.keys(groupedSchedules).sort().map((day: any, index: number) => (
                                            <div key={day} className="contents group">
                                                {/* Timeline Column */}
                                                <div className="flex flex-col items-center gap-1 pt-1 h-full">
                                                    <div className={`flex items-center justify-center size-10 rounded-full ${index === 0 ? 'bg-[#ec1325] text-white shadow-md shadow-red-500/20' : 'bg-red-50 text-[#ec1325]'}`}>
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {index === 0 ? 'stars' : 'event'}
                                                        </span>
                                                    </div>
                                                    {index !== Object.keys(groupedSchedules).length - 1 && (
                                                        <div className="w-[2px] bg-gray-100 h-full grow my-2 min-h-[40px]"></div>
                                                    )}
                                                </div>

                                                {/* Content Column */}
                                                <div className="flex flex-col pb-8 pt-1">
                                                    <span className="text-[#ec1325] text-sm font-bold tracking-wider uppercase mb-2">
                                                        Hari Ke-{day} • {getDayDate(parseInt(day))}
                                                    </span>

                                                    <div className="space-y-4">
                                                        {groupedSchedules[day].map((item: any) => (
                                                            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                                    <h3 className="font-bold text-[#181112] text-lg leading-tight">{item.title}</h3>
                                                                    <div className="flex items-center gap-2 text-xs font-medium text-[#896165] bg-white px-2 py-1 rounded border border-gray-200 self-start sm:self-auto whitespace-nowrap">
                                                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                                        <span>{item.time_start.slice(0, 5)} {item.time_end ? `- ${item.time_end.slice(0, 5)}` : ''}</span>
                                                                    </div>
                                                                </div>
                                                                {item.description && (
                                                                    <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-200 pt-2 mt-2">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-[#e6dbdc] shadow-sm sticky top-24">
                            <h3 className="font-bold text-[#181112] mb-4">Informasi Penting</h3>

                            {/* Dynamic Sidebar Items */}
                            {(!event.meta_data || !Array.isArray(event.meta_data) || event.meta_data.length === 0) ? (
                                <p className="text-sm text-gray-500 italic">Tidak ada informasi tambahan.</p>
                            ) : (
                                <div className="space-y-6">
                                    <ul className="space-y-4">
                                        {event.meta_data.filter((item: any) => item.type === 'info').map((item: any) => (
                                            <li key={item.id} className="flex gap-3">
                                                <span className="material-symbols-outlined text-[#ec1325]">{item.icon || 'info'}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-[#181112]">{item.label}</p>
                                                    <div
                                                        className="text-xs text-[#896165] whitespace-pre-wrap [&>a]:text-[#ec1325] [&>a]:underline"
                                                        dangerouslySetInnerHTML={{ __html: item.value }}
                                                    />
                                                    {item.description && (
                                                        <div
                                                            className="text-[10px] text-gray-400 mt-0.5 [&>a]:text-[#ec1325] [&>a]:underline"
                                                            dangerouslySetInnerHTML={{ __html: item.description }}
                                                        />
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-2 space-y-3">
                                        {event.meta_data.filter((item: any) => item.type === 'button').map((item: any) => (
                                            <div key={item.id}>
                                                <a
                                                    href={item.value}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#ec1325] text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/20 text-center"
                                                >
                                                    {item.icon && <span className="material-symbols-outlined text-[20px]">{item.icon}</span>}
                                                    {item.label}
                                                </a>
                                                {item.description && (
                                                    <div
                                                        className="text-xs text-center text-[#896165] mt-2 [&>a]:text-[#ec1325] [&>a]:underline"
                                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
