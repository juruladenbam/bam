import type { Submission } from '../api/submissionApi'

interface SubmissionListProps {
    submissions: Submission[]
    isLoading?: boolean
}

const typeLabels: Record<string, string> = {
    birth: 'Kelahiran',
    marriage: 'Pernikahan',
    death: 'Kematian',
    correction: 'Koreksi Data',
}

const typeIcons: Record<string, string> = {
    birth: 'child_care',
    marriage: 'favorite',
    death: 'deceased',
    correction: 'edit_note',
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
    pending: 'Menunggu Review',
    approved: 'Disetujui',
    rejected: 'Ditolak',
}

export function SubmissionList({ submissions, isLoading }: SubmissionListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-gray-200" />
                ))}
            </div>
        )
    }

    if (!submissions.length) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <span className="material-symbols-outlined text-5xl text-gray-300">inbox</span>
                <p className="mt-4 text-gray-500">Belum ada laporan</p>
                <p className="text-sm text-gray-400 mt-1">Kirim laporan pertama Anda!</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {submissions.map((submission) => (
                <div
                    key={submission.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                >
                    <div className="flex items-start gap-4">
                        {/* Type Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${submission.type === 'birth' ? 'bg-blue-100 text-blue-600' :
                                submission.type === 'marriage' ? 'bg-pink-100 text-pink-600' :
                                    submission.type === 'death' ? 'bg-gray-100 text-gray-600' :
                                        'bg-amber-100 text-amber-600'
                            }`}>
                            <span className="material-symbols-outlined text-xl">
                                {typeIcons[submission.type]}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900">
                                    {typeLabels[submission.type]}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                                    {statusLabels[submission.status]}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Dikirim {new Date(submission.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                            {submission.admin_notes && (
                                <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Catatan Admin:</span> {submission.admin_notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SubmissionList
