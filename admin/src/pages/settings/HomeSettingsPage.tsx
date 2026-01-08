import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import RichTextEditor from '../../components/editor/RichTextEditor';
import ImageUploader from '../../components/ImageUploader';

interface SettingItem {
    id: number;
    key: string;
    value: string | object;
    type: 'text' | 'html' | 'json';
}

interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

export default function HomeSettingsPage() {
    const queryClient = useQueryClient();

    // Hero
    const [heroBadge, setHeroBadge] = useState('');
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [heroImage, setHeroImage] = useState('');
    const [heroImageYear, setHeroImageYear] = useState('');
    const [heroImageCaption, setHeroImageCaption] = useState('');
    const [heroImageLocation, setHeroImageLocation] = useState('');

    // Features
    const [featuresTitle, setFeaturesTitle] = useState('');
    const [featuresSubtitle, setFeaturesSubtitle] = useState('');
    const [features, setFeatures] = useState<FeatureItem[]>([]);

    // Legacy
    const [legacyTitle, setLegacyTitle] = useState('');
    const [legacyContent, setLegacyContent] = useState('');
    const [legacyQuote, setLegacyQuote] = useState('');
    const [legacyImage, setLegacyImage] = useState('');

    // CTA
    const [ctaTitle, setCtaTitle] = useState('');
    const [ctaSubtitle, setCtaSubtitle] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['settings', 'home'],
        queryFn: () => api.get('/settings/home') as Promise<{ data: SettingItem[] }>,
    });

    const mutation = useMutation({
        mutationFn: (settings: { settings: { key: string; value: unknown; type: string }[] }) =>
            api.post('/settings/home/bulk', settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'home'] });
            alert('Pengaturan berhasil disimpan!');
        },
        onError: () => {
            alert('Gagal menyimpan pengaturan');
        },
    });

    useEffect(() => {
        if (data?.data) {
            data.data.forEach((setting: SettingItem) => {
                const shortKey = setting.key.replace('home.', '');
                switch (shortKey) {
                    case 'hero_badge': setHeroBadge(setting.value as string); break;
                    case 'hero_title': setHeroTitle(setting.value as string); break;
                    case 'hero_subtitle': setHeroSubtitle(setting.value as string); break;
                    case 'hero_image': setHeroImage(setting.value as string); break;
                    case 'hero_image_year': setHeroImageYear(setting.value as string); break;
                    case 'hero_image_caption': setHeroImageCaption(setting.value as string); break;
                    case 'hero_image_location': setHeroImageLocation(setting.value as string); break;
                    case 'features_title': setFeaturesTitle(setting.value as string); break;
                    case 'features_subtitle': setFeaturesSubtitle(setting.value as string); break;
                    case 'features': setFeatures(setting.value as FeatureItem[]); break;
                    case 'legacy_title': setLegacyTitle(setting.value as string); break;
                    case 'legacy_content': setLegacyContent(setting.value as string); break;
                    case 'legacy_quote': setLegacyQuote(setting.value as string); break;
                    case 'legacy_image': setLegacyImage(setting.value as string); break;
                    case 'cta_title': setCtaTitle(setting.value as string); break;
                    case 'cta_subtitle': setCtaSubtitle(setting.value as string); break;
                }
            });
        }
    }, [data]);

    const handleSave = () => {
        mutation.mutate({
            settings: [
                { key: 'hero_badge', value: heroBadge, type: 'text' },
                { key: 'hero_title', value: heroTitle, type: 'text' },
                { key: 'hero_subtitle', value: heroSubtitle, type: 'text' },
                { key: 'hero_image_year', value: heroImageYear, type: 'text' },
                { key: 'hero_image_caption', value: heroImageCaption, type: 'text' },
                { key: 'hero_image_location', value: heroImageLocation, type: 'text' },
                { key: 'features_title', value: featuresTitle, type: 'text' },
                { key: 'features_subtitle', value: featuresSubtitle, type: 'text' },
                { key: 'features', value: features, type: 'json' },
                { key: 'legacy_title', value: legacyTitle, type: 'text' },
                { key: 'legacy_content', value: legacyContent, type: 'html' },
                { key: 'legacy_quote', value: legacyQuote, type: 'text' },
                { key: 'cta_title', value: ctaTitle, type: 'text' },
                { key: 'cta_subtitle', value: ctaSubtitle, type: 'text' },
            ],
        });
    };

    const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
        const updated = [...features];
        updated[index] = { ...updated[index], [field]: value };
        setFeatures(updated);
    };

    const addFeature = () => {
        setFeatures([...features, { icon: 'star', title: '', description: '' }]);
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
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
                    <h1 className="text-2xl font-bold text-[#181112]">Pengaturan Halaman Beranda</h1>
                    <p className="text-[#896165] text-sm mt-1">Kelola konten yang ditampilkan di halaman utama</p>
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

            {/* Hero Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ec1325]">home</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">Hero Section</h2>
                        <p className="text-xs text-[#896165]">Banner utama di bagian atas halaman</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Badge</label>
                        <input
                            type="text"
                            value={heroBadge}
                            onChange={(e) => setHeroBadge(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                            placeholder="Portal Keluarga Resmi"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Judul</label>
                        <input
                            type="text"
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                            placeholder="Selamat Datang..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Subtitle</label>
                        <textarea
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112] resize-none"
                            placeholder="Deskripsi singkat..."
                        />
                    </div>
                    <ImageUploader
                        settingKey="home.hero_image"
                        value={heroImage}
                        onChange={setHeroImage}
                        label="Gambar Hero"
                        aspectRatio="aspect-[4/3]"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#e6dbdc] mt-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1.5">Tahun (overlay)</label>
                            <input
                                type="text"
                                value={heroImageYear}
                                onChange={(e) => setHeroImageYear(e.target.value)}
                                className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                                placeholder="Sejak 1945"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1.5">Caption (overlay)</label>
                            <input
                                type="text"
                                value={heroImageCaption}
                                onChange={(e) => setHeroImageCaption(e.target.value)}
                                className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                                placeholder="Pertemuan Akbar Keluarga"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1.5">Lokasi (overlay)</label>
                            <input
                                type="text"
                                value={heroImageLocation}
                                onChange={(e) => setHeroImageLocation(e.target.value)}
                                className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                                placeholder="Yogyakarta, Indonesia"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#ec1325]">widgets</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#181112]">Fitur Utama</h2>
                            <p className="text-xs text-[#896165]">Daftar fitur portal keluarga</p>
                        </div>
                    </div>
                    <button
                        onClick={addFeature}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#f8f6f6] hover:bg-[#e6dbdc] text-[#181112] rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Tambah
                    </button>
                </div>

                <div className="space-y-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Judul Section</label>
                        <input
                            type="text"
                            value={featuresTitle}
                            onChange={(e) => setFeaturesTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Subtitle Section</label>
                        <input
                            type="text"
                            value={featuresSubtitle}
                            onChange={(e) => setFeaturesSubtitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {features.length === 0 && (
                        <div className="text-center py-8 text-[#896165]">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">widgets</span>
                            <p className="text-sm">Belum ada fitur. Klik "Tambah" untuk menambahkan.</p>
                        </div>
                    )}
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-[#f8f6f6] rounded-xl border border-[#e6dbdc]">
                            <div className="flex-shrink-0">
                                <div className="size-10 bg-white rounded-lg flex items-center justify-center border border-[#e6dbdc]">
                                    <span className="material-symbols-outlined text-[#ec1325]">{feature.icon || 'star'}</span>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-[#896165] mb-1">Icon</label>
                                    <input
                                        type="text"
                                        value={feature.icon}
                                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#e6dbdc] rounded-lg bg-white text-[#181112] focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325]"
                                        placeholder="account_tree"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[#896165] mb-1">Judul</label>
                                    <input
                                        type="text"
                                        value={feature.title}
                                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#e6dbdc] rounded-lg bg-white text-[#181112] focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[#896165] mb-1">Deskripsi</label>
                                    <input
                                        type="text"
                                        value={feature.description}
                                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#e6dbdc] rounded-lg bg-white text-[#181112] focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325]"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeFeature(index)}
                                className="flex-shrink-0 p-2 text-[#896165] hover:text-[#ec1325] hover:bg-white rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Legacy Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ec1325]">history_edu</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">Warisan / Legacy</h2>
                        <p className="text-xs text-[#896165]">Cerita tentang sejarah keluarga</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Judul</label>
                        <input
                            type="text"
                            value={legacyTitle}
                            onChange={(e) => setLegacyTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Konten</label>
                        <RichTextEditor
                            value={legacyContent}
                            onChange={setLegacyContent}
                            placeholder="Tulis cerita warisan keluarga..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Quote</label>
                        <input
                            type="text"
                            value={legacyQuote}
                            onChange={(e) => setLegacyQuote(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                            placeholder="Kutipan inspiratif..."
                        />
                    </div>
                    <ImageUploader
                        settingKey="home.legacy_image"
                        value={legacyImage}
                        onChange={setLegacyImage}
                        label="Gambar Legacy"
                        aspectRatio="aspect-square"
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ec1325]">campaign</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">Call to Action</h2>
                        <p className="text-xs text-[#896165]">Banner ajakan bergabung di bagian bawah</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Judul</label>
                        <input
                            type="text"
                            value={ctaTitle}
                            onChange={(e) => setCtaTitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1.5">Subtitle</label>
                        <input
                            type="text"
                            value={ctaSubtitle}
                            onChange={(e) => setCtaSubtitle(e.target.value)}
                            className="w-full px-4 py-2.5 border border-[#e6dbdc] rounded-xl focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] transition-colors bg-white text-[#181112]"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
