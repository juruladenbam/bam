

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'

export default function AboutPage() {
    return (
        <div className="bg-[#f8f6f6]">
            {/* Header */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-4">Tentang Kami</h2>
                    <h1 className="text-4xl font-bold text-[#181112] mb-4">
                        Bani Abdul Manan
                    </h1>
                    <p className="text-[#896165] text-lg max-w-2xl mx-auto">
                        Keluarga besar dengan lebih dari 500 anggota dari 5 generasi, bersatu dalam keimanan dan silaturahmi.
                    </p>
                </div>
            </section>

            {/* Biografi */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-2">Pendiri</h2>
                            <h3 className="text-2xl font-bold text-[#181112] mb-4">Kakek Buyut: Abdul Manan</h3>
                            <div className="bg-white border-l-4 border-[#ec1325] p-6 rounded-r-lg shadow-sm">
                                <p className="text-[#896165] leading-relaxed">
                                    Abdul Manan adalah tokoh pendiri keluarga besar yang kini telah berkembang
                                    menjadi lebih dari 500 anggota dalam 5 generasi. Beliau memiliki 11 anak
                                    dari dua istri, yang masing-masing menjadi cabang utama silsilah keluarga.
                                </p>
                                <p className="text-[#896165] leading-relaxed mt-4">
                                    Ajaran dan nilai-nilai yang ditanamkan oleh beliau terus dipegang teguh
                                    oleh keturunannya hingga saat ini, menjadikan Bani Abdul Manan sebagai
                                    keluarga besar yang tetap rukun dan harmonis.
                                </p>
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

            {/* 11 Pilar */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-2">11 Cabang</h2>
                        <h3 className="text-2xl font-bold text-[#181112]">Pilar Keluarga</h3>
                        <p className="text-[#896165] mt-4 max-w-lg mx-auto">
                            Kakek Buyut Abdul Manan memiliki 11 anak yang menjadi pilar utama keluarga besar.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 11 }, (_, i) => (
                            <div
                                key={i}
                                className="bg-[#f8f6f6] border border-[#e6dbdc] rounded-xl p-4 text-center hover:border-[#ec1325]/30 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="size-12 mx-auto rounded-full bg-white flex items-center justify-center shadow-sm text-[#ec1325] group-hover:bg-[#ec1325] group-hover:text-white transition-colors mb-2">
                                    <span className="text-xl font-bold">{i + 1}</span>
                                </div>
                                <div className="text-xs text-[#896165]">Cabang</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nilai-nilai */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-[#ec1325] font-bold tracking-widest uppercase text-sm mb-2">Prinsip</h2>
                        <h3 className="text-2xl font-bold text-[#181112]">Nilai-nilai Keluarga</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-[#e6dbdc] rounded-xl p-6 hover:border-[#ec1325]/30 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="size-10 rounded-full bg-[#ec1325]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#ec1325]">mosque</span>
                                </div>
                                <h3 className="font-bold text-lg text-[#181112]">Keimanan</h3>
                            </div>
                            <p className="text-[#896165] text-sm">
                                Menjaga tradisi keagamaan dan ibadah bersama sebagai pondasi keluarga.
                            </p>
                        </div>

                        <div className="bg-white border border-[#e6dbdc] rounded-xl p-6 hover:border-[#ec1325]/30 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="size-10 rounded-full bg-[#ec1325]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#ec1325]">handshake</span>
                                </div>
                                <h3 className="font-bold text-lg text-[#181112]">Silaturahmi</h3>
                            </div>
                            <p className="text-[#896165] text-sm">
                                Menjaga hubungan dan komunikasi antar keluarga lintas generasi.
                            </p>
                        </div>

                        <div className="bg-white border border-[#e6dbdc] rounded-xl p-6 hover:border-[#ec1325]/30 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="size-10 rounded-full bg-[#ec1325]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#ec1325]">school</span>
                                </div>
                                <h3 className="font-bold text-lg text-[#181112]">Pendidikan</h3>
                            </div>
                            <p className="text-[#896165] text-sm">
                                Mendorong generasi muda untuk terus belajar dan berkembang.
                            </p>
                        </div>

                        <div className="bg-white border border-[#e6dbdc] rounded-xl p-6 hover:border-[#ec1325]/30 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="size-10 rounded-full bg-[#ec1325]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#ec1325]">favorite</span>
                                </div>
                                <h3 className="font-bold text-lg text-[#181112]">Kepedulian</h3>
                            </div>
                            <p className="text-[#896165] text-sm">
                                Saling membantu dalam suka dan duka, gotong royong keluarga.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-[#896165] mb-4">Ingin melihat silsilah lengkap?</p>
                    <a
                        href={`${PORTAL_URL}/login`}
                        className="inline-flex items-center gap-2 bg-[#ec1325] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91020] transition-colors"
                    >
                        <span className="material-symbols-outlined">login</span>
                        Login ke Portal
                    </a>
                </div>
            </section>
        </div>
    )
}
