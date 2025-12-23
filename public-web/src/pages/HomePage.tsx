import { Link } from 'react-router-dom'

export default function HomePage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4">
                        Bani Abdul Manan
                    </h1>
                    <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                        Portal Digital Keluarga Besar dengan 500+ anggota dari 5 generasi.
                        Menjaga silaturahmi, merawat silsilah, dan melestarikan tradisi.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/login"
                            className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-green-100 transition"
                        >
                            Login Portal
                        </Link>
                        <Link
                            to="/tentang"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                        >
                            Tentang Kami
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-4xl font-bold text-green-700">500+</div>
                            <div className="text-gray-600 mt-2">Anggota Keluarga</div>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl font-bold text-green-700">5</div>
                            <div className="text-gray-600 mt-2">Generasi</div>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl font-bold text-green-700">11</div>
                            <div className="text-gray-600 mt-2">Cabang Keluarga</div>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl font-bold text-green-700">3</div>
                            <div className="text-gray-600 mt-2">Acara Tahunan</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                        Acara Tahunan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Festival BAM */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-green-600 h-32 flex items-center justify-center">
                                <span className="text-5xl">🕌</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Festival BAM</h3>
                                <p className="text-gray-600">
                                    Rangkaian ibadah pra-Ramadhan: Tahlil, Manaqib, Ziarah, dan Maulid Diba'.
                                </p>
                            </div>
                        </div>

                        {/* Halal Bihalal */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-amber-500 h-32 flex items-center justify-center">
                                <span className="text-5xl">🤝</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Halal Bihalal</h3>
                                <p className="text-gray-600">
                                    Silaturahmi H+2 Lebaran dengan update silsilah keluarga.
                                </p>
                            </div>
                        </div>

                        {/* Merajut Cinta */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-blue-500 h-32 flex items-center justify-center">
                                <span className="text-5xl">⛺</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Merajut Cinta</h3>
                                <p className="text-gray-600">
                                    Youth camp untuk generasi muda SMP - belum menikah.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-green-800 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Bergabung dengan Portal Keluarga
                    </h2>
                    <p className="text-green-100 mb-8 max-w-xl mx-auto">
                        Akses silsilah lengkap, daftar acara, dan tetap terhubung dengan keluarga besar.
                    </p>
                    <Link
                        to="/login"
                        className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-green-100 transition inline-block"
                    >
                        Login Sekarang
                    </Link>
                </div>
            </section>
        </div>
    )
}
