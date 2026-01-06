import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { silsilahApi } from '../../features/silsilah/api/silsilahApi'
import { useDebounce } from '../../hooks/useDebounce'
import type { Person } from '../../features/silsilah/types'

export function PortalHeader() {
    const location = useLocation()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Person[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const debouncedQuery = useDebounce(searchQuery, 400)

    // Handle Search
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const results = await silsilahApi.search(debouncedQuery)
                setSearchResults(results)
                setShowResults(true)
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsSearching(false)
            }
        }

        performSearch()
    }, [debouncedQuery])

    const handleSelectPerson = (person: Person) => {
        setSearchQuery('')
        setShowResults(false)
        navigate(`/silsilah/branch/${person.branch_id}?focus=${person.id}`)
    }

    // User and Menu State
    const [user, setUser] = useState<any>(null)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    // Fetch User
    useEffect(() => {
        silsilahApi.getMe().then(data => {
            setUser(data.user)
        }).catch(err => {
            console.error('Failed to fetch user:', err)
        })
    }, [])

    // Environment Variables
    const PUBLIC_WEB_URL = import.meta.env.VITE_PUBLIC_WEB_URL || 'http://localhost:5173'

    const handleLogoutClick = () => {
        setIsUserMenuOpen(false)
        setIsMenuOpen(false)
        setShowLogoutConfirm(true)
    }

    const confirmLogout = async () => {
        try {
            await silsilahApi.logout()
            window.location.href = PUBLIC_WEB_URL
        } catch (error) {
            console.error('Logout failed:', error)
            window.location.href = PUBLIC_WEB_URL
        }
    }

    // Close menus on navigation
    useEffect(() => {
        setShowResults(false)
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
        setShowLogoutConfirm(false)
    }, [location.pathname])

    const isActive = (path: string) => {
        return location.pathname.startsWith(path)
            ? 'text-[#ec1325] font-bold'
            : 'text-[#181112] hover:text-[#ec1325] font-medium'
    }

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-[#f4f0f0] bg-white px-4 md:px-10 py-3 shadow-sm h-16">
            <div className="flex items-center gap-8">
                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="size-8 flex items-center justify-center bg-[#ec1325]/10 rounded-lg group-hover:bg-[#ec1325] transition-colors">
                        <span className="material-symbols-outlined text-[#ec1325] group-hover:text-white transition-colors">
                            account_tree
                        </span>
                    </div>
                    <h2 className="text-[#181112] text-lg font-bold leading-tight tracking-tight">
                        BAM Portal
                    </h2>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className={`text-sm transition-colors ${isActive('/') && !isActive('/silsilah') ? 'text-[#ec1325] font-bold' : 'text-[#181112] hover:text-[#ec1325] font-medium'}`}>
                        Home
                    </Link>
                    <Link to="/silsilah" className={`text-sm transition-colors ${isActive('/silsilah')}`}>
                        Silsilah
                    </Link>
                    <Link to="/events" className={`text-sm transition-colors ${isActive('/events')}`}>
                        Acara
                    </Link>
                    <Link to="/news" className={`text-sm transition-colors ${isActive('/news')}`}>
                        Berita
                    </Link>
                    <Link to="/archives" className={`text-sm transition-colors ${isActive('/archives')}`}>
                        Arsip
                    </Link>
                    <Link to="/submissions" className={`text-sm transition-colors ${isActive('/submissions')}`}>
                        Lapor Data
                    </Link>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
                {/* Search Bar (Desktop) */}
                <div className="hidden sm:flex flex-col relative min-w-40 max-w-64 w-full z-50">
                    <div className="flex w-full items-stretch rounded-lg h-10 bg-[#f8f6f6] border border-transparent focus-within:border-[#ec1325]/20 focus-within:bg-white transition-all">
                        <div className="text-[#896165] flex border-none items-center justify-center pl-3">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 bg-transparent border-none focus:ring-0 text-[#181112] placeholder:text-[#896165] px-3 text-sm focus:outline-none"
                            placeholder="Cari anggota keluarga..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowResults(true)}
                        />
                        {isSearching && (
                            <div className="flex items-center justify-center pr-3">
                                <span className="block size-4 border-2 border-[#ec1325]/30 border-t-[#ec1325] rounded-full animate-spin"></span>
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (searchResults.length > 0 || debouncedQuery.length >= 2) && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-[#f4f0f0] overflow-hidden flex flex-col max-h-80 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map((person) => (
                                    <button
                                        key={person.id}
                                        className="flex items-center gap-3 p-3 hover:bg-[#f8f6f6] transition-colors text-left w-full border-b border-[#f4f0f0] last:border-0"
                                        onClick={() => handleSelectPerson(person)}
                                    >
                                        <div
                                            className={`size-8 rounded-full bg-cover bg-center shrink-0 border border-gray-100 ${person.gender === 'male' ? 'bg-blue-50' : 'bg-pink-50'
                                                }`}
                                            style={{
                                                backgroundImage: person.photo_url ? `url(${person.photo_url})` : 'none',
                                            }}
                                        >
                                            {!person.photo_url && (
                                                <span className="flex items-center justify-center w-full h-full text-[10px] font-bold text-gray-400">
                                                    {person.full_name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-[#181112] truncate">
                                                {person.full_name}
                                            </span>
                                            {person.branch && (
                                                <span className="text-[10px] text-[#896165] truncate">
                                                    Qobilah {person.branch.name.replace('Qobilah ', '')}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                !isSearching && debouncedQuery.length >= 2 && (
                                    <div className="p-4 text-center text-xs text-[#896165]">
                                        Tidak ditemukan
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-[#181112]"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="material-symbols-outlined">
                        {isMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>

                {/* User Avatar Dropdown */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="bg-gray-200 bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-[#ec1325]/10 cursor-pointer hover:ring-[#ec1325]/30 transition-all focus:outline-none"
                    >
                        <span className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500">
                            {user?.name?.charAt(0) || 'U'}
                        </span>
                    </button>

                    {/* Desktop User Menu */}
                    {isUserMenuOpen && (
                        <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-[#f4f0f0] overflow-hidden py-1 z-50 animate-in fade-in zoom-in duration-200">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-bold text-[#181112] truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-[#896165] truncate">{user?.email}</p>
                            </div>
                            {user?.role === 'admin' && (
                                <a
                                    href="/admin"
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#181112] hover:bg-[#f8f6f6] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                    Dashboard Admin
                                </a>
                            )}
                            <button
                                onClick={handleLogoutClick}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-[#f4f0f0] shadow-lg md:hidden flex flex-col p-4 gap-4 z-50 animate-in slide-in-from-top-2">
                    <Link to="/" className="text-[#181112] font-medium py-2">Home</Link>
                    <Link to="/silsilah" className="text-[#181112] font-medium py-2">Silsilah</Link>
                    <Link to="/events" className="text-[#181112] font-medium py-2">Acara</Link>
                    <Link to="/news" className="text-[#181112] font-medium py-2">News</Link>
                    <Link to="/archives" className="text-[#181112] font-medium py-2">Arsip</Link>
                    <Link to="/submissions" className="text-[#181112] font-medium py-2">Lapor Data</Link>
                    <hr className="border-[#f4f0f0]" />
                    <div className="py-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-500">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-medium text-[#181112] text-sm">{user?.name || 'User'}</p>
                                <p className="text-xs text-[#896165]">{user?.email}</p>
                            </div>
                        </div>
                        {user?.role === 'admin' && (
                            <a href="/admin" className="flex items-center gap-2 py-2 text-sm text-[#181112]">
                                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                Dashboard Admin
                            </a>
                        )}
                        <button onClick={handleLogoutClick} className="flex items-center gap-2 py-2 text-sm text-red-600 w-full text-left">
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Keluar
                        </button>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="mb-4">
                            <span className="material-symbols-outlined text-4xl text-[#ec1325]">logout</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#181112] mb-2">Konfirmasi Keluar</h3>
                        <p className="text-[#896165] mb-6">Apakah Anda yakin ingin keluar dari portal?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl font-medium text-[#181112] bg-[#f8f6f6] hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-2.5 rounded-xl font-medium bg-[#ec1325] text-white hover:bg-red-600 transition-colors"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
