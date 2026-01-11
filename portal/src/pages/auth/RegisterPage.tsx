import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { silsilahApi } from '../../features/silsilah/api/silsilahApi'

export function RegisterPage() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const PUBLIC_WEB_URL = import.meta.env.VITE_PUBLIC_WEB_URL || 'http://localhost:5173'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak sesuai.')
            return
        }

        setLoading(true)

        try {
            await silsilahApi.register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            })

            // On success, redirect to login with message or auto-login
            // For now, redirect to login
            navigate('/login?registered=true')
        } catch (err) {
            let message = err instanceof Error ? err.message : 'Registrasi gagal. Silahkan coba lagi.'
            if (message === 'validation.unique') {
                message = 'Email sudah terdaftar. Silahkan gunakan email lain atau login.'
            }
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#f8f6f6]">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <a href={PUBLIC_WEB_URL} className="inline-flex items-center gap-2 mb-6 text-[#181112] hover:text-[#ec1325] transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="text-sm font-medium">Kembali ke Website</span>
                    </a>
                    <div className="size-16 mx-auto rounded-full bg-[#ec1325]/10 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[#ec1325] text-3xl">person_add</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#181112]">Pendaftaran Member</h1>
                    <p className="text-[#896165] mt-2">
                        Daftar untuk menjadi bagian dari keluarga besar
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 border border-[#e6dbdc]">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-[#181112] mb-1">
                            Nama Lengkap
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[#896165] text-lg">badge</span>
                            </div>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[#e6dbdc] rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-transparent bg-[#f8f6f6] text-[#181112] placeholder:text-[#896165]"
                                placeholder="Nama Lengkap"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-[#181112] mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[#896165] text-lg">mail</span>
                            </div>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[#e6dbdc] rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-transparent bg-[#f8f6f6] text-[#181112] placeholder:text-[#896165]"
                                placeholder="email@contoh.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-[#181112] mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[#896165] text-lg">key</span>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-[#e6dbdc] rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-transparent bg-[#f8f6f6] text-[#181112] placeholder:text-[#896165]"
                                placeholder="Minimal 8 karakter"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#896165] hover:text-[#ec1325] transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-[#181112] mb-1">
                            Konfirmasi Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[#896165] text-lg">lock_reset</span>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password_confirmation"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-[#e6dbdc] rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-transparent bg-[#f8f6f6] text-[#181112] placeholder:text-[#896165]"
                                placeholder="Ulangi password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#ec1325] text-white py-3 rounded-lg font-semibold hover:bg-[#c91020] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Memproses...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">how_to_reg</span>
                                Daftar
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-[#896165] text-sm mt-6">
                    Sudah punya akun?{' '}
                    <Link
                        to="/login"
                        className="text-[#ec1325] font-medium hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}
