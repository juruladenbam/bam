import { Link } from 'react-router-dom'
import SEO from '@/components/SEO'
import { useHomeContent } from '@/hooks/useHomeContent'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { ServiceCard } from '@/components/ui/ServiceCard'

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'

export default function HomePage() {
    const { data } = useHomeContent();
    const { isLoggedIn } = useAuthCheck();

    // Use data from backend or fallback to static
    const hero = data?.hero || {
        badge: 'Portal Keluarga Resmi',
        title: 'Selamat Datang di Keluarga Digital Bani Abdul Manan',
        subtitle: 'Menghubungkan generasi, melestarikan sejarah, dan merayakan masa depan bersama. Akses warisan keluarga Anda hari ini.',
        image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=60',
        image_year: 'Sejak 1945',
        image_caption: 'Pertemuan Akbar Keluarga',
        image_location: 'Yogyakarta, Indonesia',
    };

    const featuresSection = data?.features || {
        title: 'Mengapa Bergabung dengan Portal?',
        subtitle: 'Rumah digital kami memungkinkan setiap anggota keluarga tetap terhubung, terinformasi, dan terlibat dalam pelestarian silsilah.',
        items: [
            { icon: 'account_tree', title: 'Silsilah Interaktif', description: 'Jelajahi silsilah lengkap Bani Abdul Manan.' },
            { icon: 'calendar_month', title: 'Kalender Acara', description: 'Ikuti update acara keluarga mendatang.' },
            { icon: 'history_edu', title: 'Arsip Digital', description: 'Akses foto historis dan kenangan berharga.' },
        ],
    };

    const legacy = data?.legacy || {
        title: 'Legasi Abdul Manan',
        content: '<p>Kisah kami bermula dari nilai-nilai yang ditanamkan oleh leluhur kami, Abdul Manan.</p>',
        quote: 'Keluarga adalah kompas yang membimbing kita.',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=60',
    };

    const cta = data?.cta || {
        title: 'Bergabung dengan Portal Keluarga',
        subtitle: 'Akses silsilah lengkap, daftar acara, dan tetap terhubung dengan keluarga besar.',
    };

    return (
        <div>
            <SEO
                title="Beranda"
                description={hero.subtitle}
                url="/"
            />
            {/* Hero Section */}
            <section className="flex flex-1 justify-center py-5 px-4 sm:px-10 lg:px-40 bg-[#f8f6f6]">
                <div className="flex flex-col max-w-[1200px] flex-1">
                    <div className="flex flex-col gap-6 py-10 lg:flex-row items-center">
                        {/* Hero Text & Login */}
                        <div className="flex flex-col gap-6 lg:gap-8 lg:justify-center flex-1">
                            <div className="flex flex-col gap-4 text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ec1325]/10 text-[#ec1325] w-fit">
                                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                    <span className="text-xs font-bold uppercase tracking-wider">{hero.badge}</span>
                                </div>
                                <h1 className="text-[#181112] text-4xl font-black leading-tight tracking-tight lg:text-5xl xl:text-6xl">
                                    {hero.title}
                                </h1>
                                <h2 className="text-[#896165] text-lg font-normal leading-relaxed max-w-lg">
                                    {hero.subtitle}
                                </h2>
                            </div>

                            {/* Quick Access Card */}
                            <div className="p-6 bg-white border border-[#e6dbdc] rounded-xl shadow-sm max-w-[480px]">
                                <h3 className="text-base font-bold text-[#181112] mb-4">Akses Cepat Member</h3>
                                <a
                                    href={isLoggedIn ? PORTAL_URL : `${PORTAL_URL}/login`}
                                    className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-[#ec1325] text-white text-sm font-bold hover:bg-[#c91020] transition-colors"
                                >
                                    {isLoggedIn ? 'Buka Portal' : 'Login ke Portal'}
                                </a>
                                <div className="mt-3 flex justify-between text-xs">
                                    <span className="text-[#896165]">Belum punya akun?</span>
                                    <a href={`${PORTAL_URL}/register`} className="text-[#ec1325] font-medium hover:underline">
                                        Daftar Sekarang
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="w-full flex-1 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                            <div
                                className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105"
                                style={{
                                    backgroundImage: `url("${hero.image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=60'}")`,
                                }}
                            ></div>
                            <div className="absolute bottom-6 left-6 z-20 text-white">
                                <p className="text-sm font-medium opacity-90 uppercase tracking-widest mb-1">{hero.image_year}</p>
                                <p className="text-2xl font-bold">{hero.image_caption}</p>
                                <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    <span>{hero.image_location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="flex flex-1 justify-center py-10 bg-white">
                <div className="flex flex-col max-w-[1200px] flex-1 px-4 sm:px-10">
                    <div className="flex flex-col gap-10 py-10">
                        <div className="flex flex-col gap-4 text-center items-center">
                            <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm">Fitur Utama</h2>
                            <h1 className="text-[#181112] text-3xl font-bold leading-tight md:text-4xl max-w-[720px]">
                                {featuresSection.title}
                            </h1>
                            <p className="text-[#896165] text-base font-normal leading-normal max-w-[600px]">
                                {featuresSection.subtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuresSection.items.map((feature, index) => (
                                <div key={index} className="flex flex-1 gap-4 rounded-xl border border-[#e6dbdc] bg-[#f8f6f6] p-8 flex-col hover:border-[#ec1325]/30 transition-colors group cursor-pointer">
                                    <div className="size-12 rounded-full bg-white flex items-center justify-center shadow-sm text-[#ec1325] group-hover:bg-[#ec1325] group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-[#181112] text-xl font-bold leading-tight">{feature.title}</h2>
                                        <p className="text-[#896165] text-sm font-normal leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section id="events" className="flex flex-1 justify-center py-16 bg-[#f8f6f6]">
                <div className="flex flex-col max-w-[1200px] flex-1 px-4 sm:px-10">
                    <div className="flex flex-col gap-4 text-center items-center mb-12">
                        <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm">Acara Tahunan</h2>
                        <h1 className="text-[#181112] text-3xl font-bold leading-tight md:text-4xl">
                            Rangkaian Kegiatan Keluarga
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Festival BAM */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e6dbdc] hover:shadow-lg transition-shadow">
                            <div className="bg-gradient-to-br from-[#ec1325] to-[#8b0a13] h-32 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-5xl">mosque</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#181112] mb-2">Festival BAM</h3>
                                <p className="text-[#896165] text-sm">
                                    Rangkaian ibadah pra-Ramadhan: Tahlil, Manaqib, Ziarah Makam, dan Maulid Diba'.
                                </p>
                            </div>
                        </div>

                        {/* Halal Bihalal */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e6dbdc] hover:shadow-lg transition-shadow">
                            <div className="bg-gradient-to-br from-amber-500 to-amber-700 h-32 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-5xl">handshake</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#181112] mb-2">Halal Bihalal</h3>
                                <p className="text-[#896165] text-sm">
                                    Silaturahmi H+2 Lebaran dengan update silsilah dan rapat keluarga tahunan.
                                </p>
                            </div>
                        </div>

                        {/* Merajut Cinta */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e6dbdc] hover:shadow-lg transition-shadow">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-32 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-5xl">camping</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#181112] mb-2">Merajut Cinta</h3>
                                <p className="text-[#896165] text-sm">
                                    Youth camp untuk generasi muda SMP hingga belum menikah.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Layanan Keluarga Section */}
            <section id="layanan" className="flex flex-1 justify-center py-16 bg-white">
                <div className="flex flex-col max-w-[1200px] flex-1 px-4 sm:px-10">
                    <div className="flex flex-col gap-4 text-center items-center mb-12">
                        <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm">Layanan Digital</h2>
                        <h1 className="text-[#181112] text-3xl font-bold leading-tight md:text-4xl">
                            Layanan Keluarga BAM
                        </h1>
                        <p className="text-[#896165] text-base font-normal leading-normal max-w-[600px]">
                            Akses berbagai layanan digital yang disediakan untuk keluarga besar Bani Abdul Manan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        <ServiceCard
                            href="https://majmu.bamseribuputu.my.id"
                            title="Majmu' Bacaan"
                            description="Kumpulan bacaan amalan dan doa-doa dari mbah-mbah yang dapat diamalkan sehari-hari."
                            icon="auto_stories"
                            color="amber"
                            variant="full"
                        />

                        <ServiceCard
                            href="https://store.bamseribuputu.my.id"
                            title="BAM Store"
                            description="Merchandise dan produk resmi keluarga besar Bani Abdul Manan."
                            icon="storefront"
                            color="pink"
                            variant="full"
                        />
                    </div>
                </div>
            </section>

            {/* Legacy Section */}
            <section className="flex flex-1 justify-center py-12 md:py-20 px-4 sm:px-10 bg-white">
                <div className="flex flex-col max-w-[1000px] flex-1">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 flex flex-col gap-6">
                            <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm">Warisan Kami</h2>
                            <h3 className="text-[#181112] text-3xl font-bold leading-tight">{legacy.title}</h3>
                            <div
                                className="text-[#896165] text-lg leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0"
                                dangerouslySetInnerHTML={{ __html: legacy.content }}
                            />
                            <Link
                                to="/tentang"
                                className="w-fit mt-2 text-[#181112] font-bold underline decoration-[#ec1325] decoration-2 underline-offset-4 hover:text-[#ec1325] transition-colors"
                            >
                                Baca Sejarah Lengkap
                            </Link>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="relative w-full aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden bg-[#e6dbdc]">
                                <img
                                    alt="Legacy Photo"
                                    className="w-full h-full object-cover sepia-[.3] hover:sepia-0 transition-all duration-500"
                                    src={legacy.image || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=60'}
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                    <blockquote className="italic font-light">"{legacy.quote}"</blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-br from-[#ec1325] to-[#8b0a13] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {cta.title}
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        {cta.subtitle}
                    </p>
                    <a
                        href={isLoggedIn ? PORTAL_URL : `${PORTAL_URL}/login`}
                        className="bg-white text-[#ec1325] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
                    >
                        {isLoggedIn ? 'Buka Portal' : 'Login Sekarang'}
                    </a>
                </div>
            </section>
        </div>
    )
}
