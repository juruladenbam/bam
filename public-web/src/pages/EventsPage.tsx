import { useEvents, EventCard } from '@/features/events';
import SEO from '@/components/SEO';
import { useAuthCheck } from '@/hooks/useAuthCheck';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'

export default function EventsPage() {
    const { data, isLoading, error } = useEvents();
    const { isLoggedIn } = useAuthCheck();

    return (
        <div>
            <SEO
                title="Acara"
                description="Jadwal acara keluarga besar Bani Abdul Manan. Festival BAM, Halal Bihalal, Merajut Cinta, dan kegiatan keluarga lainnya."
                url="/acara"
            />
            {/* Header */}
            <section className="bg-gradient-to-br from-[#ec1325] to-[#8b0a13] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Acara Keluarga</h1>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        Rangkaian kegiatan dan acara keluarga besar Bani Abdul Manan sepanjang tahun.
                    </p>
                </div>
            </section>

            {/* Events Grid */}
            <section className="py-16 bg-[#f8f6f6]">
                <div className="container mx-auto px-4 max-w-[1200px]">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-5xl text-[#ec1325]/30">error</span>
                            <p className="mt-4 text-[#896165]">Gagal memuat data acara</p>
                        </div>
                    ) : data?.data && data.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {data.data.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-5xl text-[#896165]/30">event_busy</span>
                            <p className="mt-4 text-[#896165]">Belum ada acara yang dijadwalkan</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-[#181112] mb-4">
                        Ingin berpartisipasi dalam acara?
                    </h2>
                    <p className="text-[#896165] mb-6 max-w-lg mx-auto">
                        Login ke Portal Member untuk mendaftar acara dan mendapatkan update terbaru.
                    </p>
                    <a
                        href={isLoggedIn ? PORTAL_URL : `${PORTAL_URL}/login`}
                        className="inline-block px-8 py-3 bg-[#ec1325] text-white font-semibold rounded-lg hover:bg-[#c91020] transition-colors"
                    >
                        {isLoggedIn ? 'Buka Portal' : 'Login ke Portal'}
                    </a>
                </div>
            </section>
        </div>
    );
}
