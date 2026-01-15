import { useEffect, useState } from 'react';
import { silsilahApi } from '../features/silsilah/api/silsilahApi';

interface NibGuideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentNib?: string;
}

export function NibGuideDrawer({ isOpen, onClose, currentNib }: NibGuideDrawerProps) {
    const [guideData, setGuideData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGuide();
        }
    }, [isOpen, currentNib]);

    const fetchGuide = async () => {
        setIsLoading(true);
        try {
            const data = await silsilahApi.getNibGuide(currentNib);
            setGuideData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity cursor-pointer"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-gray-900 text-lg">Panduan Format NIB</h3>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <span className="block size-6 border-2 border-[#ec1325]/30 border-t-[#ec1325] rounded-full animate-spin"></span>
                        </div>
                    ) : guideData ? (
                        <>
                            {/* Pattern visualization */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-center text-gray-500 mb-3">{guideData.pattern.description}</p>
                                <div className="flex items-center justify-center gap-1 font-mono text-lg font-bold flex-wrap">
                                    {guideData.segments.map((seg: any, idx: number) => (
                                        <span key={idx} style={{ color: seg.color }}>
                                            {seg.example}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Segments */}
                            <div className="space-y-3">
                                {guideData.segments.map((seg: any, idx: number) => (
                                    <div key={idx} className="flex gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold font-mono text-lg"
                                            style={{ backgroundColor: `${seg.color}20`, color: seg.color }}
                                        >
                                            {seg.example}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{seg.label}</p>
                                            <p className="text-xs text-gray-600 leading-relaxed">{seg.description}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Posisi: {seg.position}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Examples */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3 text-sm">Contoh Penggunaan</h4>
                                <div className="space-y-3">
                                    {guideData.examples.map((ex: any, idx: number) => (
                                        <div key={idx} className="text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-mono font-bold text-gray-800 tracking-wide">{ex.nib_with_checksum}</div>
                                            </div>
                                            <div className="text-xs text-gray-500">{ex.meaning}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">Gagal memuat panduan.</p>
                            <button onClick={() => fetchGuide()} className="text-[#ec1325] text-sm mt-2 font-medium">Coba lagi</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
