import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    useSubmission,
    useApproveSubmission,
    useRejectSubmission,
    SubmissionDetail,
    ApprovalDialog,
    RejectionDialog,
} from '../../features/submissions'

export function SubmissionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)

    const { data, isLoading, error } = useSubmission(Number(id))
    const approveMutation = useApproveSubmission()
    const rejectMutation = useRejectSubmission()

    const submission = data?.data

    const handleApprove = (notes?: string) => {
        approveMutation.mutate(
            { id: Number(id), notes },
            {
                onSuccess: () => {
                    setShowApproveDialog(false)
                    navigate('/submissions')
                },
            }
        )
    }

    const handleReject = (reason: string) => {
        rejectMutation.mutate(
            { id: Number(id), reason },
            {
                onSuccess: () => {
                    setShowRejectDialog(false)
                    navigate('/submissions')
                },
            }
        )
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
                    <div className="h-64 bg-gray-200 rounded-xl" />
                </div>
            </div>
        )
    }

    if (error || !submission) {
        return (
            <div className="p-6 lg:p-8">
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-red-300">error</span>
                    <p className="mt-4 text-gray-500">Submission tidak ditemukan</p>
                    <Link to="/submissions" className="text-[#ec1325] hover:underline mt-2 inline-block">
                        Kembali ke daftar
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-[#ec1325]">Dashboard</Link>
                    <span>/</span>
                    <Link to="/submissions" className="hover:text-[#ec1325]">Submission</Link>
                    <span>/</span>
                    <span>Detail</span>
                </div>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Detail Submission</h1>
                    <Link
                        to="/submissions"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Kembali
                    </Link>
                </div>
            </div>

            {/* Content */}
            <SubmissionDetail submission={submission} />

            {/* Action Buttons (Only for pending) */}
            {submission.status === 'pending' && (
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => setShowRejectDialog(true)}
                        className="px-6 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                        Tolak
                    </button>
                    <button
                        onClick={() => setShowApproveDialog(true)}
                        className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">check</span>
                        Setujui
                    </button>
                </div>
            )}

            {/* Dialogs */}
            <ApprovalDialog
                isOpen={showApproveDialog}
                onClose={() => setShowApproveDialog(false)}
                onApprove={handleApprove}
                isLoading={approveMutation.isPending}
            />
            <RejectionDialog
                isOpen={showRejectDialog}
                onClose={() => setShowRejectDialog(false)}
                onReject={handleReject}
                isLoading={rejectMutation.isPending}
            />
        </div>
    )
}

export default SubmissionDetailPage
