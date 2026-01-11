import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useMySubmissions, SubmissionForm, SubmissionList } from '../../features/submissions'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useMe } from '../../features/silsilah'

export function SubmissionsPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)
    const { data: submissions, isLoading: submissionsLoading } = useMySubmissions()
    const { data: userData, isLoading: userLoading } = useMe()

    const isLoading = submissionsLoading || userLoading
    const user = userData?.user
    const isUnlinked = user && !user.person_id

    // Check if we came from Silsilah (has preselectedPerson)
    const fromSilsilah = !!location.state?.preselectedPerson

    useEffect(() => {
        if (fromSilsilah) {
            setShowForm(true)
        }
    }, [fromSilsilah])

    const handleCancel = () => {
        if (fromSilsilah) {
            // Navigate back to the specific branch and person
            const person = location.state.preselectedPerson
            const branchId = person.branch_id
            navigate(`/silsilah/branch/${branchId}?focus=${person.id}`)
        } else {
            setShowForm(false)
        }
    }
    if (isLoading) {
        return (
            <MobileLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec1325]" />
                </div>
            </MobileLayout>
        )
    }

    return (
        <MobileLayout>
            <div className="relative flex-1">
                {/* Overlay Blur for Unlinked Users */}
                {isUnlinked && (
                    <div className="absolute inset-0 z-[100] backdrop-blur-md bg-white/30 flex items-center justify-center px-6">
                        <div className="bg-white rounded-2xl shadow-2xl border border-[#e6dbdc] p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
                            <div className="size-16 rounded-full bg-[#ec1325]/10 flex items-center justify-center mx-auto mb-6 text-[#ec1325]">
                                <span className="material-symbols-outlined text-4xl">link_off</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#181112] mb-3">Akses Terbatas</h2>
                            <p className="text-[#896165] text-sm mb-8 leading-relaxed">
                                Mohon maaf, fitur lapor data hanya dapat diakses oleh anggota yang sudah menautkan akun dengan data keluarga.
                            </p>
                            <Link
                                to="/claim-profile"
                                className="block w-full bg-[#ec1325] text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                            >
                                Tautkan Akun Sekarang
                            </Link>
                            <Link
                                to="/"
                                className="block w-full text-[#896165] text-sm font-medium mt-4 hover:text-[#181112] transition-colors"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                )}

                <div className={`flex-1 max-w-4xl mx-auto w-full px-4 md:px-10 py-8 ${isUnlinked ? 'h-[80vh] overflow-hidden' : ''}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3">
                                {fromSilsilah && (
                                    <button
                                        onClick={() => {
                                            const person = location.state.preselectedPerson
                                            const branchId = person.branch_id
                                            navigate(`/silsilah/branch/${branchId}?focus=${person.id}`)
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
                                        title="Kembali ke Silsilah"
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                )}
                                <h1 className="text-2xl font-bold text-gray-900">Laporan Data</h1>
                            </div>
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
                                onCancel={handleCancel}
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
                                isLoading={submissionsLoading}
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
            </div>
        </MobileLayout>
    )
}

export default SubmissionsPage
