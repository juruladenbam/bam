import { Link } from 'react-router-dom'
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
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
}

export function SubmissionList({ submissions, isLoading }: SubmissionListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-200" />
                ))}
            </div>
        )
    }

    if (!submissions.length) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <span className="material-symbols-outlined text-5xl text-gray-300">inbox</span>
                <p className="mt-4 text-gray-500">Tidak ada submission</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {submissions.map((submission) => (
                <Link
                    key={submission.id}
                    to={`/submissions/${submission.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#ec1325]/30 transition-all group"
                >
                    <div className="flex items-start gap-4">
                        {/* Type Icon */}
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${submission.type === 'birth' ? 'bg-blue-100 text-blue-600' :
                                submission.type === 'marriage' ? 'bg-pink-100 text-pink-600' :
                                    submission.type === 'death' ? 'bg-gray-100 text-gray-600' :
                                        'bg-amber-100 text-amber-600'
                            }`}>
                            <span className="material-symbols-outlined text-2xl">
                                {typeIcons[submission.type]}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#ec1325] transition-colors">
                                    {typeLabels[submission.type]}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                                    {statusLabels[submission.status]}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Diajukan oleh <span className="font-medium">{submission.user?.name || 'Unknown'}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(submission.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        {/* Arrow */}
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-[#ec1325] transition-colors">
                            arrow_forward
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default SubmissionList
