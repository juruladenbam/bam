import { Link, useParams } from 'react-router-dom'

export function MarriageFormPage() {
    const { id } = useParams()
    const isEdit = !!id

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/marriages" className="p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[#896165]">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">
                        {isEdit ? 'Edit Pernikahan' : 'Tambah Pernikahan Baru'}
                    </h1>
                    <p className="text-sm text-[#896165]">
                        {isEdit ? 'Perbarui data pernikahan' : 'Masukkan data pernikahan baru'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form className="bg-white rounded-xl border border-[#e6dbdc] p-6 space-y-6">
                {/* Pasangan */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Pasangan</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Suami *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Cari nama suami..."
                            />
                            <p className="text-xs text-[#896165] mt-1">Ketik untuk mencari</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Istri *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Cari nama istri..."
                            />
                            <p className="text-xs text-[#896165] mt-1">Ketik untuk mencari</p>
                        </div>
                    </div>
                </div>

                {/* Detail */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Detail Pernikahan</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Nikah</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Lokasi</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Lokasi pernikahan"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_active" defaultChecked className="accent-[#ec1325]" />
                        <label htmlFor="is_active" className="text-sm text-[#181112]">Pernikahan masih aktif</label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6dbdc]">
                    <Link
                        to="/marriages"
                        className="px-4 py-2 border border-[#e6dbdc] rounded-lg text-[#181112] font-medium hover:bg-[#f8f6f6] transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Pernikahan'}
                    </button>
                </div>
            </form>
        </div>
    )
}
