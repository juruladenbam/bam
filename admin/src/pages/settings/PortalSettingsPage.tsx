import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { adminApi } from '../../features/admin/api/adminApi';

interface SettingItem {
    id: number;
    key: string;
    value: string | boolean;
    type: 'text' | 'html' | 'json' | 'boolean';
}

export default function PortalSettingsPage() {
    const queryClient = useQueryClient();

    // Portal Settings State
    const [loginEnabled, setLoginEnabled] = useState(true);
    const [nibClaimingEnabled, setNibClaimingEnabled] = useState(true);

    // Fetch Settings
    const { data, isLoading } = useQuery({
        queryKey: ['settings', 'portal'],
        queryFn: () => api.get('/settings/portal') as Promise<{ data: SettingItem[] }>,
    });

    // Save Mutation
    const mutation = useMutation({
        mutationFn: (settings: { settings: { key: string; value: string; type: string }[] }) =>
            api.post('/settings/portal/bulk', settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'portal'] });
            alert('Pengaturan portal berhasil disimpan!');
        },
        onError: () => {
            alert('Gagal menyimpan pengaturan portal');
        },
    });

    // Populate State from Data
    useEffect(() => {
        if (data?.data) {
            data.data.forEach((setting: SettingItem) => {
                const shortKey = setting.key.replace('portal.', '');
                // Backend returns "true"/"false" strings or "1"/"0" for boolean type in text column often, 
                // but let's assume it matches the seeder 'true' string.
                // It's safer to check for 'true' string or boolean true.
                const isTrue = setting.value === 'true' || setting.value === '1' || setting.value === true;

                switch (shortKey) {
                    case 'login_enabled': setLoginEnabled(isTrue); break;
                    case 'nib_claiming_enabled': setNibClaimingEnabled(isTrue); break;
                }
            });
        }
    }, [data]);

    const handleSave = () => {
        mutation.mutate({
            settings: [
                {
                    key: 'portal.login_enabled',
                    value: loginEnabled ? 'true' : 'false',
                    type: 'boolean'
                },
                {
                    key: 'portal.nib_claiming_enabled',
                    value: nibClaimingEnabled ? 'true' : 'false',
                    type: 'boolean'
                },
            ],
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-[#e6dbdc] rounded-lg w-1/3"></div>
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
                    <h1 className="text-2xl font-bold text-[#181112]">Pengaturan Autentikasi Portal</h1>
                    <p className="text-[#896165] text-sm mt-1">Kelola metode akses dan fitur keamanan portal keluarga</p>
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

            {/* Access Mode Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 bg-[#ec1325]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ec1325]">security</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">Mode Akses</h2>
                        <p className="text-xs text-[#896165]">Atur bagaimana anggota keluarga mengakses portal</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Login Toggle */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-base font-medium text-[#181112] mb-1">Sistem Login (Autentikasi Penuh)</h3>
                            <p className="text-sm text-[#896165] max-w-xl">
                                Jika aktif, user wajib login untuk mengakses fitur portal.
                                Jika nonaktif, portal akan berjalan dalam mode <strong>NIB-Only</strong>.
                            </p>

                            {!loginEnabled && (
                                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 text-sm text-blue-800">
                                    <span className="material-symbols-outlined text-[20px] text-blue-600">info</span>
                                    <div>
                                        <strong>Mode NIB-Only Aktif:</strong>
                                        <ul className="list-disc ml-4 mt-1 space-y-0.5">
                                            <li>User dapat mengakses tanpa password (cukup NIB)</li>
                                            <li>Fitur edit dan lapor data terbatas</li>
                                            <li>Blur overlay dimatikan</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => setLoginEnabled(!loginEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ec1325] focus:ring-offset-2 ${loginEnabled ? 'bg-[#ec1325]' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`${loginEnabled ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-[#e6dbdc]"></div>

                    {/* NIB Check Toggle */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-base font-medium text-[#181112] mb-1">Fitur Tautkan NIB</h3>
                            <p className="text-sm text-[#896165] max-w-xl">
                                Izinkan user menautkan identitas mereka menggunakan NIB (Nomor Induk BAM).
                                Diperlukan untuk mode NIB-Only.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => setNibClaimingEnabled(!nibClaimingEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ec1325] focus:ring-offset-2 ${nibClaimingEnabled ? 'bg-[#ec1325]' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`${nibClaimingEnabled ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Maintenance & Data Section */}
            <section className="bg-white rounded-xl border border-[#e6dbdc] p-6 mb-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-600">settings_suggest</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181112]">Pemeliharaan Data (Database Maintenance)</h2>
                        <p className="text-xs text-[#896165]">Alat bantu untuk memulihkan konsistensi data sistem</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-base font-medium text-[#181112] mb-1">Membangun Ulang Seluruh NIB (Rebuild NIB Tree)</h3>
                            <p className="text-sm text-[#896165] max-w-xl">
                                Gunakan ini jika nomor NIB tidak sinkron dengan urutan kelahiran terbaru (biasanya karena data lama). 
                                Seluruh NIB silsilah akan di-reset dan dibangun ulang dari tingkat Root.
                            </p>
                            <div className="mt-2 text-[10px] text-red-500 font-medium py-1 px-2 bg-red-50 rounded border border-red-100 inline-block">
                                <span className="material-symbols-outlined text-[12px] align-middle mr-1">warning</span>
                                Aksi ini bersifat permanen dan memakan waktu tergantung jumlah data.
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-400 mb-1">Urutan Root</label>
                                <input 
                                    type="number" 
                                    defaultValue={8} 
                                    id="root_order"
                                    className="w-16 px-2 py-1 border border-gray-200 rounded text-sm mb-2" 
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    const confirm = window.confirm("Yakin ingin membangun ulang seluruh NIB? Seluruh data akan di-reset dan di-sinkronkan ulang.");
                                    if (!confirm) return;
                                    
                                    const btn = document.getElementById('rebuild-btn') as HTMLButtonElement;
                                    const rootOrder = (document.getElementById('root_order') as HTMLInputElement).value || '8';
                                    
                                    btn.disabled = true;
                                    btn.innerText = "Memproses...";
                                    
                                    try {
                                        await adminApi.rebuildNibs(parseInt(rootOrder));
                                        alert("Berhasil! Seluruh NIB telah dibangun ulang.");
                                    } catch (err) {
                                        alert("Terjadi kesalahan saat membangun ulang NIB.");
                                    } finally {
                                        btn.disabled = false;
                                        btn.innerText = "Mulai Rebuild";
                                    }
                                }}
                                id="rebuild-btn"
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                            >
                                Mulai Rebuild
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
