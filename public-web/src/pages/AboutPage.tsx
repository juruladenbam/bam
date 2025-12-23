export default function AboutPage() {
    return (
        <div className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Tentang Bani Abdul Manan
                </h1>

                {/* Biografi */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-green-700">
                        Kakek Buyut: Abdul Manan
                    </h2>
                    <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                        <p className="text-gray-700 leading-relaxed">
                            Abdul Manan adalah tokoh pendiri keluarga besar yang kini telah berkembang
                            menjadi lebih dari 500 anggota dalam 5 generasi. Beliau memiliki 11 anak
                            dari dua istri, yang masing-masing menjadi cabang utama silsilah keluarga.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            Ajaran dan nilai-nilai yang ditanamkan oleh beliau terus dipegang teguh
                            oleh keturunannya hingga saat ini, menjadikan Bani Abdul Manan sebagai
                            keluarga besar yang tetap rukun dan harmonis.
                        </p>
                    </div>
                </section>

                {/* 11 Pilar */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-green-700">
                        11 Pilar Keluarga
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Kakek Buyut Abdul Manan memiliki 11 anak yang menjadi pilar utama
                        keluarga besar. Setiap cabang memiliki karakteristik dan sejarahnya masing-masing.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 11 }, (_, i) => (
                            <div
                                key={i}
                                className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition"
                            >
                                <div className="text-2xl font-bold text-green-600">{i + 1}</div>
                                <div className="text-sm text-gray-500 mt-1">Cabang ke-{i + 1}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sejarah Musholla */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-green-700">
                        Musholla Keluarga
                    </h2>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                        <p className="text-gray-700 leading-relaxed">
                            Musholla keluarga menjadi pusat kegiatan spiritual dan pertemuan keluarga.
                            Di tempat inilah berbagai acara tahunan seperti Festival BAM, Halal Bihalal,
                            dan kegiatan keagamaan lainnya diselenggarakan.
                        </p>
                    </div>
                </section>

                {/* Nilai-nilai */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-green-700">
                        Nilai-nilai Keluarga
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-bold text-lg mb-2">🤲 Keimanan</h3>
                            <p className="text-gray-600 text-sm">
                                Menjaga tradisi keagamaan dan ibadah bersama.
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-bold text-lg mb-2">🤝 Silaturahmi</h3>
                            <p className="text-gray-600 text-sm">
                                Menjaga hubungan dan komunikasi antar keluarga.
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-bold text-lg mb-2">📚 Pendidikan</h3>
                            <p className="text-gray-600 text-sm">
                                Mendorong generasi muda untuk terus belajar.
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-bold text-lg mb-2">💚 Kepedulian</h3>
                            <p className="text-gray-600 text-sm">
                                Saling membantu dalam suka dan duka.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
