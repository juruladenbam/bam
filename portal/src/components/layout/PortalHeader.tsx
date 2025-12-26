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

    // Close on click outside (simple version: close on navigation change)
    useEffect(() => {
        setShowResults(false)
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
                    <Link to="/archives" className={`text-sm transition-colors ${isActive('/archives')}`}>
                        Arsip
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

                {/* User Avatar */}
                <div className="hidden md:block bg-gray-200 bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-[#ec1325]/10 cursor-pointer hover:ring-[#ec1325]/30 transition-all">
                    <span className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500">
                        U
                    </span>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-[#f4f0f0] shadow-lg md:hidden flex flex-col p-4 gap-4 z-50 animate-in slide-in-from-top-2">
                    <Link to="/" className="text-[#181112] font-medium py-2">Home</Link>
                    <Link to="/silsilah" className="text-[#181112] font-medium py-2">Silsilah</Link>
                    <Link to="/events" className="text-[#181112] font-medium py-2">Acara</Link>
                    <Link to="/archives" className="text-[#181112] font-medium py-2">Arsip</Link>
                    <hr className="border-[#f4f0f0]" />
                    <div className="flex items-center gap-3 py-2">
                        <div className="size-8 rounded-full bg-gray-200"></div>
                        <span className="font-medium text-[#181112]">User Profile</span>
                    </div>
                </div>
            )}
        </header>
    )
}
