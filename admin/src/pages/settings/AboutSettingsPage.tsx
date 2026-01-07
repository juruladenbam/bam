import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import RichTextEditor from '../../components/editor/RichTextEditor';

interface SettingItem {
    id: number;
    key: string;
    value: string | object;
    type: 'text' | 'html' | 'json';
}

interface ValueItem {
    icon: string;
    title: string;
    description: string;
}

export default function AboutSettingsPage() {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [biographyTitle, setBiographyTitle] = useState('');
    const [biographyContent, setBiographyContent] = useState('');
    const [values, setValues] = useState<ValueItem[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ['settings', 'about'],
        queryFn: () => api.get('/settings/about') as Promise<{ data: SettingItem[] }>,
    });

    const mutation = useMutation({
        mutationFn: (settings: { settings: { key: string; value: unknown; type: string }[] }) =>
            api.post('/settings/about/bulk', settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'about'] });
            alert('Pengaturan berhasil disimpan!');
        },
        onError: () => {
            alert('Gagal menyimpan pengaturan');
        },
    });

    useEffect(() => {
        if (data?.data) {
            data.data.forEach((setting: SettingItem) => {
                const shortKey = setting.key.replace('about.', '');
                switch (shortKey) {
                    case 'title':
                        setTitle(setting.value as string);
                        break;
                    case 'subtitle':
                        setSubtitle(setting.value as string);
                        break;
                    case 'biography_title':
                        setBiographyTitle(setting.value as string);
                        break;
                    case 'biography_content':
                        setBiographyContent(setting.value as string);
                        break;
                    case 'values':
                        setValues(setting.value as ValueItem[]);
                        break;
                }
            });
        }
    }, [data]);

    const handleSave = () => {
        mutation.mutate({
            settings: [
                { key: 'title', value: title, type: 'text' },
                { key: 'subtitle', value: subtitle, type: 'text' },
                { key: 'biography_title', value: biographyTitle, type: 'text' },
                { key: 'biography_content', value: biographyContent, type: 'html' },
                { key: 'values', value: values, type: 'json' },
            ],
        });
    };

    const updateValue = (index: number, field: keyof ValueItem, newValue: string) => {
        const updated = [...values];
        updated[index] = { ...updated[index], [field]: newValue };
        setValues(updated);
    };

    const addValue = () => {
        setValues([...values, { icon: 'star', title: '', description: '' }]);
    };

    const removeValue = (index: number) => {
        setValues(values.filter((_, i) => i !== index));
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-[#e6dbdc] rounded-lg w-1/3"></div>
                    <div className="h-48 bg-[#e6dbdc] rounded-xl"></div>
                    <div className="h-48 bg-[#e6dbdc] rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#181112]">Pengaturan Halaman Tentang</h1>
                    <p className="text-[#896165] text-sm mt-1">Kelola konten yang ditampilkan di halaman Tentang Kami</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ec1325] text-white rounded-xl font-medium hover:bg-[#c91020] disabled:opacity-50 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>

            {/* Header Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ec1325]">title</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">Header</h2>
                        <p className="text-xs text-[#896165]">Judul dan deskripsi singkat</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Judul</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                            placeholder="Bani Abdul Manan"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Subtitle</label>
                        <textarea
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112] resize-none"
                            placeholder="Deskripsi singkat keluarga..."
                        />
                    </div>
                </div>
            </section>

            {/* Biography Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ec1325]">person</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">Biografi Pendiri</h2>
                        <p className="text-xs text-[#896165]">Cerita tentang tokoh pendiri keluarga</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Judul Biografi</label>
                        <input
                            type="text"
                            value={biographyTitle}
                            onChange={(e) => setBiographyTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                            placeholder="Kakek Buyut: Abdul Manan"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">
                            Konten Biografi
                        </label>
                        <RichTextEditor
                            value={biographyContent}
                            onChange={setBiographyContent}
                            placeholder="Tulis konten biografi..."
                        />
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#ec1325]">favorite</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#181112]">Nilai-nilai Keluarga</h2>
                            <p className="text-xs text-[#896165]">Prinsip dan nilai yang dipegang keluarga</p>
                        </div>
                    </div>
                    <button
                        onClick={addValue}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#f8f6f6] hover:bg-[#e6dbdc] text-[#181112] rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Tambah
                    </button>
                </div>
                <div className="space-y-3">
                    {values.length === 0 && (
                        <div className="text-center py-8 text-[#896165]">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">list</span>
                            <p className="text-sm">Belum ada nilai. Klik "Tambah" untuk menambahkan.</p>
                        </div>
                    )}
                    {values.map((value, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-[#f8f6f6] rounded-xl border border-[#e6dbdc]">
                            <div className="flex-shrink-0">
                                <div className="size-10 bg-white rounded-lg flex items-center justify-center border border-[#e6dbdc]">
                                    <span className="material-symbols-outlined text-[#ec1325]">{value.icon || 'star'}</span>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-[#896165] mb-1">Icon</label>
                                    <input
                                        type="text"
                                        value={value.icon}
                                        onChange={(e) => updateValue(index, 'icon', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#e6dbdc] rounded-lg bg-white text-[#181112] focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325]"
                                        placeholder="mosque"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[#896165] mb-1">Judul</label>
                                    <input
                                        type="text"
                                        value={value.title}
                                        onChange={(e) => updateValue(index, 'title', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#e6dbdc] rounded-lg bg-white text-[#181112] focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325]"
                                        placeholder="Keimanan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[#896165] mb-1">Deskripsi</label>
                                    <input
                                        type="text"
                                        value={value.description}
                                        onChange={(e) => updateValue(index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#e6dbdc] rounded-lg bg-white text-[#181112] focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325]"
                                        placeholder="Deskripsi nilai..."
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeValue(index)}
                                className="flex-shrink-0 p-2 text-[#896165] hover:text-[#ec1325] hover:bg-white rounded-lg transition-colors"
                                title="Hapus"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

