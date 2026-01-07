import { useParams, Link } from 'react-router-dom';
import { useEvent } from '@/features/events';
import SEO from '@/components/SEO';

export default function EventDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading, error } = useEvent(slug || '');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] py-16">
                <div className="container mx-auto px-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#ec1325]/30">event_busy</span>
                    <h1 className="text-2xl font-bold text-[#181112] mt-4">Acara Tidak Ditemukan</h1>
                    <p className="text-[#896165] mt-2">Acara yang Anda cari tidak tersedia.</p>
                    <Link
                        to="/acara"
                        className="inline-block mt-6 px-6 py-3 bg-[#ec1325] text-white rounded-lg font-semibold hover:bg-[#c91020] transition-colors"
                    >
                        Kembali ke Daftar Acara
                    </Link>
                </div>
            </div>
        );
    }

    const event = data.data;
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString?: string) => {
        if (!timeString) return '';
        return timeString.slice(0, 5); // HH:MM
    };

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <SEO
                title={event.name}
                description={event.description?.substring(0, 160) || `Acara ${event.name} - Bani Abdul Manan`}
                url={`/acara/${event.slug}`}
                image={event.thumbnail_url}
            />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#ec1325] to-[#8b0a13] text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link
                        to="/acara"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Kembali ke Daftar Acara
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
                    <div className="flex flex-wrap gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            <span>{formatDate(event.start_date)}</span>
                            {event.end_date && event.end_date !== event.start_date && (
                                <span> - {formatDate(event.end_date)}</span>
                            )}
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {event.thumbnail_url && (
                                <img
                                    src={event.thumbnail_url}
                                    alt={event.name}
                                    className="w-full rounded-xl shadow-md mb-8"
                                />
                            )}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6dbdc]">
                                <h2 className="text-xl font-bold text-[#181112] mb-4">Deskripsi</h2>
                                <div
                                    className="prose prose-sm text-[#896165] max-w-none"
                                    dangerouslySetInnerHTML={{ __html: event.description || '' }}
                                />
                            </div>
                        </div>

                        {/* Sidebar - Schedules */}
                        <div className="lg:col-span-1">
                            {event.schedules && event.schedules.length > 0 && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6dbdc]">
                                    <h2 className="text-lg font-bold text-[#181112] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#ec1325]">schedule</span>
                                        Jadwal Acara
                                    </h2>
                                    <div className="space-y-4">
                                        {event.schedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="border-l-4 border-[#ec1325] pl-4 py-2"
                                            >
                                                <p className="text-sm text-[#896165]">
                                                    {formatDate(schedule.date)}
                                                    {schedule.start_time && (
                                                        <span className="ml-2">
                                                            {formatTime(schedule.start_time)}
                                                            {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="font-semibold text-[#181112]">{schedule.title}</p>
                                                {schedule.description && (
                                                    <p className="text-sm text-[#896165] mt-1">{schedule.description}</p>
                                                )}
                                                {schedule.location && (
                                                    <p className="text-xs text-[#896165] mt-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                                        {schedule.location}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
