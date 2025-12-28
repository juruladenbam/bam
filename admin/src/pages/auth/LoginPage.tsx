import { useState } from 'react'
import { useLogin } from '../../features/auth/hooks/useAuth'

export function LoginPage() {
    const login = useLogin()
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        login.mutate(credentials, {
            onError: (err: any) => {
                console.error('Login error:', err)
                // Extract laravel validation message usually in errors.email or message
                const msg = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.'
                setError(msg)
            }
        })
    }

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl border border-[#e6dbdc] shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="bg-[#ec1325]/10 size-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-[#ec1325]">admin_panel_settings</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#181112]">Admin Portal</h1>
                    <p className="text-[#896165]">Silakan login untuk melanjutkan</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50 transition-colors"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#181112] mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={login.isPending}
                        className="w-full py-3 bg-[#ec1325] text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {login.isPending ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                Memproses...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">login</span>
                                Masuk
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
