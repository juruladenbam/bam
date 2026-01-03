import type { Submission } from '../api/submissionApi'

interface SubmissionDetailProps {
    submission: Submission
}

const typeLabels: Record<string, string> = {
    birth: 'Kelahiran',
    marriage: 'Pernikahan',
    death: 'Kematian',
    correction: 'Koreksi Data',
}

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
    const renderDataField = (key: string, value: any) => {
        if (value === null || value === undefined) return null

        // Format dates
        if (key.includes('date') && typeof value === 'string') {
            value = new Date(value).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })
        }

        // Format boolean
        if (typeof value === 'boolean') {
            value = value ? 'Ya' : 'Tidak'
        }

        const labels: Record<string, string> = {
            full_name: 'Nama Lengkap',
            nickname: 'Nama Panggilan',
            gender: 'Jenis Kelamin',
            birth_date: 'Tanggal Lahir',
            birth_place: 'Tempat Lahir',
            death_date: 'Tanggal Wafat',
            death_place: 'Tempat Wafat',
            branch_id: 'Cabang',
            parent_marriage_id: 'Pernikahan Orang Tua',
            husband_id: 'Suami',
            wife_id: 'Istri',
            marriage_date: 'Tanggal Nikah',
            person_id: 'ID Orang',
        }

        return (
            <div key={key} className="py-3 border-b border-gray-100 last:border-0">
                <dt className="text-sm text-gray-500">{labels[key] || key}</dt>
                <dd className="text-gray-900 font-medium mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </dd>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {typeLabels[submission.type]}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Diajukan oleh {submission.user?.name || 'Unknown'} ({submission.user?.email})
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {submission.status === 'pending' ? 'Menunggu Review' :
                            submission.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                    </span>
                </div>
            </div>

            {/* Data */}
            <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Data yang Diajukan
                </h3>
                <dl className="divide-y divide-gray-100">
                    {Object.entries(submission.data).map(([key, value]) =>
                        renderDataField(key, value)
                    )}
                </dl>
            </div>

            {/* Review Info (if reviewed) */}
            {submission.reviewed_at && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Hasil Review
                    </h3>
                    <div className="text-sm text-gray-600">
                        <p>
                            Direview oleh <span className="font-medium">{submission.reviewer?.name}</span> pada{' '}
                            {new Date(submission.reviewed_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                        {submission.admin_notes && (
                            <p className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-500">Catatan:</span> {submission.admin_notes}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SubmissionDetail
