import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalMode } from '../../hooks/usePortalMode';
import { silsilahApi } from '../../features/silsilah/api/silsilahApi';
import { NibGuideDrawer } from '../../components/NibGuideDrawer';

export function LinkNibPage() {
    const navigate = useNavigate();
    const { linkNib, nibClaimingEnabled } = usePortalMode();

    // Form States
    const [nib, setNib] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<any>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [isLinking, setIsLinking] = useState(false);

    // If setting is loaded and disabled, block access
    // Note: usePortalMode handles loading state, but here we just check value roughly.
    // Ideally waiting for loading, but 'true' default handles flash.
    if (nibClaimingEnabled === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6] p-4 text-center">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm">
                    <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[32px] text-gray-400">link_off</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Fitur Dinonaktifkan</h1>
                    <p className="text-gray-600 mb-6 text-sm">Fitur penautan NIB saat ini sedang dinonaktifkan oleh administrator.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#ec1325] text-white py-3 rounded-xl font-bold hover:bg-[#c91020] transition-colors"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    const handleValidate = async () => {
        if (nib.length < 3) return;
        setIsValidating(true);
        setError(null);
        setPreview(null);

        try {
            const res = await silsilahApi.validateNib(nib);
            if (res.valid) {
                setPreview(res.preview);
            } else {
                setError(res.error || 'NIB tidak valid');
            }
        } catch (e: any) {
            setError(e.message || 'Terjadi kesalahan validasi');
        } finally {
            setIsValidating(false);
        }
    };

    const handleLink = async () => {
        setIsLinking(true);
        setError(null);
        try {
            await linkNib(nib);
            // Success - Redirect home
            navigate('/', { replace: true });
        } catch (e: any) {
            setError(e.message || 'Gagal menautkan NIB');
            setIsLinking(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (preview) {
                handleLink();
            } else {
                handleValidate();
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="font-bold text-lg text-gray-900">Tautkan NIB</h1>
            </div>

            <div className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col justify-center py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="text-center mb-6">
                        <div className="size-16 bg-[#ec1325]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[32px] text-[#ec1325]">fingerprint</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Identitas Digital</h2>
                        <p className="text-sm text-gray-600 mt-1">Masukkan Nomor Induk BAM (NIB) Anda untuk memverifikasi identitas dan mengakses portal.</p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">NIB (Termasuk Checksum)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] font-mono text-lg text-center tracking-widest placeholder:tracking-normal transition-all"
                                    placeholder="Contoh: 08010001"
                                    value={nib}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setNib(val);
                                        if (preview && val !== nib) setPreview(null);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    inputMode="numeric"
                                    maxLength={20}
                                />
                            </div>
                            <div className="flex justify-center mt-3">
                                <button
                                    onClick={() => setShowGuide(true)}
                                    className="text-xs text-[#ec1325] font-medium flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">help</span>
                                    Panduan Format NIB
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                                <span className="mt-0.5">{error}</span>
                            </div>
                        )}

                        {preview && (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs text-green-700 font-bold mb-3 text-center uppercase tracking-wide">Data Terverifikasi</p>
                                <div className="flex items-center gap-4 bg-white/60 p-3 rounded-lg border border-green-100/50">
                                    <div className={`size-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${preview.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                        <span className="font-bold text-lg">{preview.full_name?.charAt(0)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{preview.full_name}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                                            <span className="material-symbols-outlined text-[14px]">account_tree</span>
                                            <span className="truncate">{preview.branch?.name} • Gen {preview.generation}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-green-600 text-center mt-3">
                                    Pastikan data di atas adalah benar milik Anda.
                                </p>
                            </div>
                        )}

                        <div className="pt-2">
                            {preview ? (
                                <button
                                    onClick={handleLink}
                                    disabled={isLinking}
                                    className="w-full bg-[#ec1325] text-white py-3.5 rounded-xl font-bold hover:bg-[#c91020] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-[0.98]"
                                >
                                    {isLinking ? (
                                        <>
                                            <span className="block size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Menautkan...
                                        </>
                                    ) : (
                                        <>
                                            <span>Ya, Hubungkan Saya</span>
                                            <span className="material-symbols-outlined text-[20px]">check</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleValidate}
                                    disabled={isValidating || nib.length < 3}
                                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 active:scale-[0.98]"
                                >
                                    {isValidating ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="block size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Memeriksa...
                                        </div>
                                    ) : 'Periksa NIB'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    &copy; {new Date().getFullYear()} Bani Abdul Manan Portal
                </p>
            </div>

            <NibGuideDrawer
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                currentNib={nib}
            />
        </div>
    );
}
