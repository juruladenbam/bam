import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Get CSRF cookie first
            await fetch(`${API_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
                credentials: 'include',
            })

            // Login - using new guest endpoint
            const response = await fetch(`${API_URL}/guest/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login gagal')
            }

            // Redirect to portal
            window.location.href = PORTAL_URL
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Login Portal</h1>
                    <p className="text-gray-600 mt-2">
                        Masuk untuk akses silsilah lengkap dan fitur member
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="email@contoh.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Memproses...' : 'Login'}
                    </button>

                    <div className="mt-6 text-center text-gray-600">
                        <p>
                            Belum punya akun?{' '}
                            <Link to="/register" className="text-green-700 font-medium hover:underline">
                                Daftar
                            </Link>
                        </p>
                    </div>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Setelah login, Anda akan dialihkan ke Portal Member
                </p>
            </div>
        </div>
    )
}
