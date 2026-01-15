import { Link, useNavigate } from 'react-router-dom'
import { usePortalMode } from '../../hooks/usePortalMode'
import { silsilahApi } from '../../features/silsilah/api/silsilahApi'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useState } from 'react'

export function ProfilePage() {
    const {
        user,
        linkedPerson,
        isAuthenticated,
        isNibLinked,
        isGuest,
        unlinkNib,
        loginEnabled,
        nibClaimingEnabled
    } = usePortalMode()

    const navigate = useNavigate()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Used for redirect fallback or external links if needed
    // const PUBLIC_WEB_URL = import.meta.env.VITE_PUBLIC_WEB_URL || 'http://localhost:5173'

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            if (isAuthenticated) {
                await silsilahApi.logout()
                window.location.href = '/login'
            } else if (isNibLinked) {
                unlinkNib()
                setShowLogoutConfirm(false)
                setIsLoggingOut(false)
                navigate('/')
            } else {
                navigate('/')
            }
        } catch (error) {
            console.error('Logout failed:', error)
            navigate('/')
        }
    }

    const renderHeader = () => {
        if (isGuest) {
            return (
                <div className="text-center mb-8">
                    <div className="size-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl font-bold mb-4 shadow-sm">
                        <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#181112]">Mode Tamu</h1>
                    <p className="text-[#896165]">Anda belum login</p>
                </div>
            )
        }

        const displayName = user?.name || linkedPerson?.full_name || 'Pengguna';
        const displaySub = user?.email || (isNibLinked ? 'Akses via NIB' : '');
        const initial = displayName.charAt(0);

        return (
            <div className="text-center mb-8">
                <div
                    className="size-24 mx-auto rounded-full bg-gradient-to-br from-[#ec1325] to-[#181112] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg"
                >
                    {initial}
                </div>
                <h1 className="text-2xl font-bold text-[#181112]">{displayName}</h1>
                <p className="text-[#896165]">{displaySub}</p>
                {isNibLinked && (
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
                        NIB Linked
                    </span>
                )}
            </div>
        )
    }

    return (
        <MobileLayout>
            <div className="max-w-2xl mx-auto w-full px-4 py-8">
                {renderHeader()}

                <div className="space-y-4">
                    {/* Guest Actions */}
                    {isGuest && (
                        <div className="bg-white border border-[#e6dbdc] rounded-xl p-4 space-y-3">
                            {loginEnabled && (
                                <Link
                                    to="/login"
                                    className="block w-full text-center bg-[#ec1325] text-white font-bold py-3 rounded-xl hover:bg-[#c91020] transition-colors"
                                >
                                    Login Akun
                                </Link>
                            )}
                            {nibClaimingEnabled && (
                                <Link
                                    to="/link-nib"
                                    className="block w-full text-center bg-white border border-[#ec1325] text-[#ec1325] font-bold py-3 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    Tautkan NIB
                                </Link>
                            )}
                            {!loginEnabled && !nibClaimingEnabled && (
                                <p className="text-center text-gray-500 text-sm">
                                    Opsi login dinonaktifkan saat ini.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Linked Person Profile (for Auth or NIB) */}
                    {(isAuthenticated || isNibLinked) && (
                        !linkedPerson ? (
                            isAuthenticated ? (
                                <Link
                                    to="/claim-profile"
                                    className="block bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-red-600">link_off</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-red-700">Akun Belum Terhubung</p>
                                            <p className="text-sm text-red-600">Tautkan akun dengan data silsilah Anda</p>
                                        </div>
                                        <span className="material-symbols-outlined text-red-400">chevron_right</span>
                                    </div>
                                </Link>
                            ) : null
                        ) : (
                            <Link
                                to={`/silsilah/person/${linkedPerson.id}`}
                                className="block bg-white border border-[#e6dbdc] rounded-xl p-4 hover:border-[#ec1325]/30 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${linkedPerson.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                                        }`}>
                                        <span className="material-symbols-outlined">
                                            {linkedPerson.gender === 'male' ? 'man' : 'woman'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[#181112]">{linkedPerson.full_name}</p>
                                        <div className="flex items-center gap-1.5 text-sm text-[#896165]">
                                            <span className="truncate">{linkedPerson.branch?.name}</span>
                                            <span>•</span>
                                            <span>Gen {linkedPerson.generation}</span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-[#e6dbdc]">chevron_right</span>
                                </div>
                            </Link>
                        )
                    )}

                    {/* Menu Items */}
                    <div className="bg-white border border-[#e6dbdc] rounded-xl overflow-hidden divide-y divide-[#f4f0f0]">
                        {/* Admin Dashboard Link (Only Auth) */}
                        {isAuthenticated && user?.role === 'admin' && (
                            <a
                                href="/admin"
                                target="_blank"
                                className="flex items-center gap-3 p-4 hover:bg-[#f8f6f6] transition-colors"
                            >
                                <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-600">admin_panel_settings</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-[#181112]">Dashboard Admin</p>
                                    <p className="text-xs text-[#896165]">Kelola data portal</p>
                                </div>
                                <span className="material-symbols-outlined text-[#e6dbdc]">open_in_new</span>
                            </a>
                        )}

                        {/* Help / Info - Always Visible */}
                        <div className="flex items-center gap-3 p-4 text-[#896165]">
                            <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-400">info</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-[#181112]">Bantuan</p>
                                <p className="text-xs text-[#896165]">Hubungi admin untuk bantuan</p>
                            </div>
                        </div>
                    </div>

                    {/* Logout/Unlink Button */}
                    {(isAuthenticated || isNibLinked) && (
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-red-200 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            {isNibLinked ? 'Lepas Tautan NIB' : 'Keluar'}
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-[#896165] mt-8">
                    BAM Portal v1.0.0
                </p>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in duration-200 whitespace-normal">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-4xl text-[#ec1325]">logout</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#181112] mb-2">{isNibLinked ? 'Lepas Tautan?' : 'Konfirmasi Keluar'}</h3>
                        <p className="text-[#896165] mb-6">
                            {isNibLinked
                                ? 'Akses personalisasi NIB Anda akan dihapus dari perangkat ini.'
                                : 'Apakah Anda yakin ingin keluar dari portal?'
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                disabled={isLoggingOut}
                                className="flex-1 py-2.5 rounded-xl font-medium text-[#181112] bg-[#f8f6f6] hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex-1 py-2.5 rounded-xl font-medium bg-[#ec1325] text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                        Proses...
                                    </>
                                ) : (
                                    isNibLinked ? 'Ya, Lepas' : 'Ya, Keluar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayout>
    )
}
