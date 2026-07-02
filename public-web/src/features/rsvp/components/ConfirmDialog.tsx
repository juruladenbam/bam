import { useEffect } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Kehadiran',
    message,
    confirmText = 'Ya, saya tidak ikut',
    cancelText = 'Batal',
}: ConfirmDialogProps) {
    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with premium blur */}
            <div
                className="absolute inset-0 bg-[#4A6741]/20 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#D4C5B2] transition-all transform scale-100 duration-300 animate-fade-in flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-full flex-shrink-0">
                        <span className="material-symbols-outlined text-[24px]">warning</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-6">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 border border-[#D4C5B2] rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2.5 bg-[#ec1325] text-white rounded-xl text-sm font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
