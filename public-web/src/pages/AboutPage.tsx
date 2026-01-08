import SEO from '@/components/SEO'
import { useAboutContent } from '@/hooks/useAboutContent'
import { useAuthCheck } from '@/hooks/useAuthCheck'

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'

export default function AboutPage() {
    const { data, isLoading } = useAboutContent();
    const { isLoggedIn } = useAuthCheck();

    // Fallback values
    const title = data?.title || 'Bani Abdul Manan';
    const subtitle = data?.subtitle || 'Keluarga besar dengan lebih dari 500 anggota dari 5 generasi, bersatu dalam keimanan dan silaturahmi.';
    const biographyTitle = data?.biography_title || 'Kakek Buyut: Abdul Manan';
    const biographyContent = data?.biography_content || '<p>Abdul Manan adalah tokoh pendiri keluarga besar...</p>';
    const values = data?.values || [];
    const branches = data?.branches || [];
    const totalMembers = data?.total_members || 500;

    return (
        <div className="bg-[#f8f6f6]">
            <SEO
                title="Tentang Kami"
                description={subtitle}
                url="/tentang"
            />
            {/* Header */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-4">Tentang Kami</h2>
                    <h1 className="text-4xl font-bold text-[#181112] mb-4">
                        {title}
                    </h1>
                    <p className="text-[#896165] text-lg max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>
            </section>

            {/* Biografi */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-2">Pendiri</h2>
                            <h3 className="text-2xl font-bold text-[#181112] mb-4">{biographyTitle}</h3>
                            <div className="bg-white border-l-4 border-[#ec1325] p-6 rounded-r-lg shadow-sm">
                                <div
                                    className="text-[#896165] leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: biographyContent }}
                                />
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="aspect-square bg-gradient-to-br from-[#ec1325]/20 to-[#ec1325]/5 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#ec1325] text-[120px]">family_restroom</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cabang/Qobilah */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-2">{branches.length} Qobilah</h2>
                        <h3 className="text-2xl font-bold text-[#181112]">Qobilah Keluarga</h3>
                        <p className="text-[#896165] mt-4 max-w-lg mx-auto">
                            {totalMembers.toLocaleString('id-ID')} anggota tersebar dalam {branches.length} qobilah.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-24"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {branches.map((branch) => (
                                <div
                                    key={branch.id}
                                    className="bg-[#f8f6f6] border border-[#e6dbdc] rounded-xl p-4 text-center hover:border-[#ec1325]/30 hover:shadow-md transition-all group"
                                >
                                    <div className="size-10 mx-auto rounded-full bg-white flex items-center justify-center shadow-sm text-[#ec1325] group-hover:bg-[#ec1325] group-hover:text-white transition-colors mb-2">
                                        <span className="text-lg font-bold">{branch.order}</span>
                                    </div>
                                    <div className="text-xs font-medium text-[#181112] line-clamp-2">{branch.name}</div>
                                    <div className="text-xs text-[#896165] mt-1">{branch.persons_count} anggota</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Nilai-nilai */}
            {values.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-2">Prinsip</h2>
                            <h3 className="text-2xl font-bold text-[#181112]">Nilai-nilai Keluarga</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {values.map((value, index) => (
                                <div key={index} className="bg-white border border-[#e6dbdc] rounded-xl p-6 hover:border-[#ec1325]/30 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 rounded-full bg-[#ec1325]/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#ec1325]">{value.icon}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-[#181112]">{value.title}</h3>
                                    </div>
                                    <p className="text-[#896165] text-sm">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-[#896165] mb-4">Ingin melihat silsilah lengkap?</p>
                    <a
                        href={isLoggedIn ? PORTAL_URL : `${PORTAL_URL}/login`}
                        className="inline-flex items-center gap-2 bg-[#ec1325] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91020] transition-colors"
                    >
                        <span className="material-symbols-outlined">{isLoggedIn ? 'dashboard' : 'login'}</span>
                        {isLoggedIn ? 'Buka Portal' : 'Login ke Portal'}
                    </a>
                </div>
            </section>
        </div>
    )
}
