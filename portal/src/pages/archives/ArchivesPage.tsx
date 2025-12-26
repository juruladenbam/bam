import { PortalHeader } from '../../components/layout/PortalHeader'

interface ArchiveItem {
    id: number
    title: string
    type: 'document' | 'photo' | 'video' | 'audio'
    date: string
    description: string
    thumbnail?: string
}

// Placeholder data - nanti bisa diganti dengan API
const archives: ArchiveItem[] = [
    {
        id: 1,
        title: 'Silsilah Asli Bani Abdul Manan',
        type: 'document',
        date: '1920',
        description: 'Dokumen silsilah asli yang ditulis tangan oleh para sesepuh keluarga.',
    },
    {
        id: 2,
        title: 'Foto Haul Akbar 2024',
        type: 'photo',
        date: '2024-03-15',
        description: 'Dokumentasi foto kegiatan Haul Akbar Bani Abdul Manan tahun 2024.',
    },
    {
        id: 3,
        title: 'Rekaman Ceramah KH. Ahmad Marzuqi',
        type: 'audio',
        date: '2020-05-10',
        description: 'Rekaman ceramah dari salah satu ulama keluarga Bani Abdul Manan.',
    },
    {
        id: 4,
        title: 'Video Silaturahmi Nasional 2023',
        type: 'video',
        date: '2023-06-20',
        description: 'Dokumentasi video kegiatan Silaturahmi Nasional BAM di Surabaya.',
    },
]

const typeIcons: Record<ArchiveItem['type'], string> = {
    document: 'description',
    photo: 'photo_library',
    audio: 'headphones',
    video: 'videocam',
}

const typeLabels: Record<ArchiveItem['type'], string> = {
    document: 'Dokumen',
    photo: 'Foto',
    audio: 'Audio',
    video: 'Video',
}

const typeColors: Record<ArchiveItem['type'], string> = {
    document: 'bg-blue-50 text-blue-600',
    photo: 'bg-green-50 text-green-600',
    audio: 'bg-orange-50 text-orange-600',
    video: 'bg-purple-50 text-purple-600',
}

export function ArchivesPage() {
    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            <PortalHeader />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#181112] mb-2 tracking-tight">
                        Arsip Keluarga
                    </h1>
                    <p className="text-[#896165] max-w-2xl">
                        Koleksi dokumen, foto, video, dan rekaman bersejarah keluarga besar Bani Abdul Manan.
                        Melestarikan warisan untuk generasi mendatang.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {(['document', 'photo', 'audio', 'video'] as const).map((type) => {
                        const count = archives.filter((a) => a.type === type).length
                        return (
                            <div
                                key={type}
                                className="bg-white border border-[#e6dbdc] rounded-xl p-4 flex items-center gap-3"
                            >
                                <div className={`size-10 rounded-lg flex items-center justify-center ${typeColors[type]}`}>
                                    <span className="material-symbols-outlined">{typeIcons[type]}</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-[#181112]">{count}</p>
                                    <p className="text-xs text-[#896165]">{typeLabels[type]}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Archives Grid */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-[#181112] mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ec1325]">inventory_2</span>
                        Koleksi Arsip
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {archives.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-[#e6dbdc] rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                            >
                                {/* Thumbnail */}
                                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                    <span className={`material-symbols-outlined text-5xl opacity-30 ${typeColors[item.type].split(' ')[1]}`}>
                                        {typeIcons[item.type]}
                                    </span>
                                </div>

                                <div className="p-4">
                                    {/* Type Badge */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${typeColors[item.type]}`}>
                                            {typeLabels[item.type]}
                                        </span>
                                        <span className="text-[10px] text-[#896165]">{item.date}</span>
                                    </div>

                                    <h3 className="font-bold text-sm text-[#181112] mb-1 group-hover:text-[#ec1325] transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-xs text-[#896165] line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-8 bg-gradient-to-r from-[#ec1325]/5 to-transparent border border-[#ec1325]/10 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-full bg-[#ec1325]/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#ec1325]">construction</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#181112] mb-1">Fitur Dalam Pengembangan</h3>
                            <p className="text-sm text-[#896165]">
                                Halaman ini masih dalam tahap pengembangan. Nantinya akan tersedia fitur upload arsip,
                                pencarian, dan akses ke dokumen digital lengkap.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contribute CTA */}
                <div className="mt-6 bg-white border border-[#e6dbdc] rounded-xl p-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div className="size-16 rounded-full bg-[#f8f6f6] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-[#ec1325]">upload</span>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h3 className="font-bold text-[#181112] mb-1">Punya Arsip Keluarga?</h3>
                            <p className="text-sm text-[#896165]">
                                Jika Anda memiliki foto, dokumen, atau rekaman bersejarah keluarga, silakan hubungi admin untuk menambahkan ke koleksi arsip.
                            </p>
                        </div>
                        <button className="px-5 py-2.5 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-700 transition-colors shrink-0">
                            Hubungi Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
