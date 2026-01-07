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
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString?: string | null) => {
        if (!timeString) return '';
        return timeString.slice(0, 5); // HH:MM
    };

    // Calculate date for schedule based on day_sequence
    const getScheduleDate = (daySequence: number) => {
        const startDate = new Date(event.start_date);
        startDate.setDate(startDate.getDate() + daySequence - 1);
        return startDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    // Group schedules by day_sequence
    const schedulesByDay = event.schedules?.reduce((acc, schedule) => {
        const day = schedule.day_sequence;
        if (!acc[day]) acc[day] = [];
        acc[day].push(schedule);
        return acc;
    }, {} as Record<number, typeof event.schedules>);

    // Strip HTML tags for SEO description
    const plainDescription = event.description?.replace(/<[^>]*>/g, '').substring(0, 160);

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <SEO
                title={event.name}
                description={plainDescription || `Acara ${event.name} - Bani Abdul Manan`}
                url={`/acara/${event.slug}`}
                image={event.thumbnail || undefined}
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
                        {event.location_name && (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {event.location_maps_url ? (
                                    <a href={event.location_maps_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {event.location_name}
                                    </a>
                                ) : (
                                    <span>{event.location_name}</span>
                                )}
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
                            {event.thumbnail && (
                                <img
                                    src={event.thumbnail}
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

                            {/* Meta Data */}
                            {event.meta_data && event.meta_data.length > 0 && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6dbdc] mt-6">
                                    <h2 className="text-lg font-bold text-[#181112] mb-4">Informasi Tambahan</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {event.meta_data.map((meta) => (
                                            <div key={meta.id} className="flex gap-3 p-3 bg-[#f8f6f6] rounded-lg">
                                                <span className="material-symbols-outlined text-[#ec1325]">{meta.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-[#181112]">{meta.label}</p>
                                                    <p className="text-sm text-[#896165]">{meta.value}</p>
                                                    {meta.description && (
                                                        <div
                                                            className="text-xs text-[#896165] mt-1 [&>p]:m-0 [&_a]:text-[#ec1325] [&_a]:underline"
                                                            dangerouslySetInnerHTML={{ __html: meta.description }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Schedules */}
                        <div className="lg:col-span-1">
                            {schedulesByDay && Object.keys(schedulesByDay).length > 0 && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6dbdc]">
                                    <h2 className="text-lg font-bold text-[#181112] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#ec1325]">schedule</span>
                                        Jadwal Acara
                                    </h2>
                                    <div className="space-y-6">
                                        {Object.entries(schedulesByDay).map(([day, schedules]) => (
                                            <div key={day}>
                                                <h3 className="text-sm font-bold text-[#ec1325] mb-3 pb-2 border-b border-[#e6dbdc]">
                                                    Hari {day}: {getScheduleDate(Number(day))}
                                                </h3>
                                                <div className="space-y-3">
                                                    {schedules?.map((schedule) => (
                                                        <div
                                                            key={schedule.id}
                                                            className="border-l-4 border-[#ec1325]/30 pl-3 py-1"
                                                        >
                                                            <p className="text-xs text-[#896165]">
                                                                {formatTime(schedule.time_start)}
                                                                {schedule.time_end && ` - ${formatTime(schedule.time_end)}`}
                                                            </p>
                                                            <p className="font-medium text-[#181112] text-sm">{schedule.title}</p>
                                                            {schedule.description && (
                                                                <p className="text-xs text-[#896165] mt-1">{schedule.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
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

