import { useState } from 'react'
import { useMySubmissions, SubmissionForm, SubmissionList } from '../../features/submissions'
import { MobileLayout } from '../../components/layout/MobileLayout'

export function SubmissionsPage() {
    const [showForm, setShowForm] = useState(false)
    const { data: submissions, isLoading } = useMySubmissions()

    return (
        <MobileLayout>
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-10 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Data</h1>
                        <p className="text-gray-500 mt-1">
                            Kirim laporan kelahiran, pernikahan, kematian, atau koreksi data
                        </p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-[#c91020] transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Buat Laporan
                        </button>
                    )}
                </div>

                {/* Form or List */}
                {showForm ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <SubmissionForm
                            onSuccess={() => setShowForm(false)}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        {submissions && submissions.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {submissions.filter((s) => s.status === 'pending').length}
                                    </p>
                                    <p className="text-sm text-gray-500">Menunggu</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {submissions.filter((s) => s.status === 'approved').length}
                                    </p>
                                    <p className="text-sm text-gray-500">Disetujui</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                    <p className="text-2xl font-bold text-red-600">
                                        {submissions.filter((s) => s.status === 'rejected').length}
                                    </p>
                                    <p className="text-sm text-gray-500">Ditolak</p>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <SubmissionList
                            submissions={submissions || []}
                            isLoading={isLoading}
                        />
                    </>
                )}

                {/* Info Card */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-blue-600">info</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">Cara Kerja Laporan</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Laporan yang Anda kirim akan direview oleh admin</li>
                                <li>• Setelah disetujui, data akan otomatis diperbarui di silsilah</li>
                                <li>• Anda akan melihat status laporan di halaman ini</li>
                                <li>• Jika ditolak, admin akan memberikan alasan penolakan</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    )
}

export default SubmissionsPage
