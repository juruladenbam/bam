export function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-[#ec1325]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#ec1325]">group</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#181112]">766</p>
                            <p className="text-sm text-[#896165]">Total Anggota</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-green-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">favorite</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#181112]">690</p>
                            <p className="text-sm text-[#896165]">Masih Hidup</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-pink-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-pink-600">favorite</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#181112]">245</p>
                            <p className="text-sm text-[#896165]">Pernikahan</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">account_tree</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#181112]">10</p>
                            <p className="text-sm text-[#896165]">Qobilah</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-[#e6dbdc]">
                <h3 className="font-bold text-[#181112] mb-4">Aksi Cepat</h3>
                <div className="flex flex-wrap gap-3">
                    <a href="/persons/new" className="inline-flex items-center gap-2 px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Tambah Anggota
                    </a>
                    <a href="/marriages/new" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e6dbdc] text-[#181112] rounded-lg font-medium hover:bg-[#f8f6f6] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        Tambah Pernikahan
                    </a>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-gradient-to-r from-[#ec1325]/5 to-transparent border border-[#ec1325]/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="size-12 rounded-full bg-[#ec1325]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#ec1325]">construction</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#181112] mb-1">Admin Panel</h3>
                        <p className="text-sm text-[#896165]">
                            Dashboard ini menampilkan statistik utama. Gunakan menu di samping untuk mengelola data silsilah.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
