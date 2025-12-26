import { Link, useParams } from 'react-router-dom'

export function PersonFormPage() {
    const { id } = useParams()
    const isEdit = !!id

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/persons" className="p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[#896165]">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">
                        {isEdit ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                    </h1>
                    <p className="text-sm text-[#896165]">
                        {isEdit ? 'Perbarui data anggota keluarga' : 'Masukkan data anggota keluarga baru'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form className="bg-white rounded-xl border border-[#e6dbdc] p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Informasi Dasar</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Nama Lengkap *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Nama Panggilan</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Nama panggilan (opsional)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Jenis Kelamin *</label>
                            <select className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50">
                                <option value="">Pilih jenis kelamin</option>
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Qobilah *</label>
                            <select className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50">
                                <option value="">Pilih qobilah</option>
                                <option value="1">Qobilah Chamdanah</option>
                                <option value="2">Qobilah Ahmad</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Lahir</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Generasi</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Nomor generasi"
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-[#181112] border-b border-[#e6dbdc] pb-2">Status</h2>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="is_alive" value="1" defaultChecked className="accent-[#ec1325]" />
                            <span className="text-sm text-[#181112]">Masih Hidup</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="is_alive" value="0" className="accent-[#ec1325]" />
                            <span className="text-sm text-[#181112]">Almarhum/Almarhumah</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Wafat</label>
                        <input
                            type="date"
                            className="w-full md:w-1/2 px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6dbdc]">
                    <Link
                        to="/persons"
                        className="px-4 py-2 border border-[#e6dbdc] rounded-lg text-[#181112] font-medium hover:bg-[#f8f6f6] transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}
                    </button>
                </div>
            </form>
        </div>
    )
}
