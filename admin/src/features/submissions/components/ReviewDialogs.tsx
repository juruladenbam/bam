import { useState } from 'react'

interface ApprovalDialogProps {
    isOpen: boolean
    onClose: () => void
    onApprove: (notes?: string) => void
    isLoading?: boolean
}

export function ApprovalDialog({ isOpen, onClose, onApprove, isLoading }: ApprovalDialogProps) {
    const [notes, setNotes] = useState('')

    if (!isOpen) return null

    const handleApprove = () => {
        onApprove(notes || undefined)
        setNotes('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Setujui Submission
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Apakah Anda yakin ingin menyetujui submission ini? Data akan diterapkan ke sistem.
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan (Opsional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Tambahkan catatan jika diperlukan..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        )}
                        Setujui
                    </button>
                </div>
            </div>
        </div>
    )
}

interface RejectionDialogProps {
    isOpen: boolean
    onClose: () => void
    onReject: (reason: string) => void
    isLoading?: boolean
}

export function RejectionDialog({ isOpen, onClose, onReject, isLoading }: RejectionDialogProps) {
    const [reason, setReason] = useState('')

    if (!isOpen) return null

    const handleReject = () => {
        if (!reason.trim()) return
        onReject(reason)
        setReason('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tolak Submission
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Berikan alasan penolakan agar pengirim dapat memperbaiki data.
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alasan Penolakan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        placeholder="Jelaskan alasan penolakan..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={isLoading || !reason.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        )}
                        Tolak
                    </button>
                </div>
            </div>
        </div>
    )
}
