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
            // General
            full_name: 'Nama Lengkap',
            nickname: 'Nama Panggilan',
            gender: 'Jenis Kelamin',
            birth_date: 'Tanggal Lahir',
            birth_place: 'Tempat Lahir',
            notes: 'Catatan',

            // Death
            death_date: 'Tanggal Wafat',
            death_place: 'Tempat Wafat',
            burial_place: 'Tempat Dimakamkan',

            // Relationships
            branch_id: 'Cabang',
            parent_marriage_id: 'Pernikahan Orang Tua',
            husband_id: 'ID Suami (Database)',
            wife_id: 'ID Istri (Database)',
            father_id: 'ID Ayah (Database)',
            mother_id: 'ID Ibu (Database)',
            person_id: 'ID Orang (Database)',

            // Marriage / Names
            husband_name: 'Nama Suami',
            wife_name: 'Nama Istri',
            marriage_date: 'Tanggal Nikah',

            // Correction
            field_select: 'Bagian yang Salah',
            field: 'Detail Bagian',
            correct_value: 'Data Seharusnya',
            person_name: 'Nama Orang',

            // Others
            birth_order: 'Anak ke-',
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

    const renderCorrectionDetail = (data: any) => {
        return (
            <div className="space-y-6">
                {/* 1. Who is being corrected */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Anggota yang Dilaporkan
                    </h4>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                {data.person_name?.charAt(0) || data.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-lg">
                                    {data.person_name || data.full_name || '-'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    ID Database: <span className="font-mono bg-white px-1 rounded border">{data.person_id}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. What is being corrected */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Detail Perbaikan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <span className="block text-xs text-gray-500 mb-1">Bagian yang Salah</span>
                            <span className="block font-medium text-gray-900 text-lg">
                                {data.field_select && data.field_select !== 'other'
                                    ? data.field_select
                                    : (data.field || '-')}
                            </span>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <span className="block text-xs text-green-700 mb-1">Data Seharusnya (Usulan)</span>
                            <span className="block font-bold text-green-900 text-lg">
                                {data.correct_value || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Explanation */}
                {data.notes && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Keterangan / Penjelasan
                        </h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 italic">
                            "{data.notes}"
                        </div>
                    </div>
                )}
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
                {submission.type === 'correction' ? (
                    renderCorrectionDetail(submission.data)
                ) : (
                    <>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Data yang Diajukan
                        </h3>
                        <dl className="divide-y divide-gray-100">
                            {Object.entries(submission.data).map(([key, value]) =>
                                renderDataField(key, value)
                            )}
                        </dl>
                    </>
                )}
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
