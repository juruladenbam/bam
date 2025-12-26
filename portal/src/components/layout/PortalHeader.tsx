import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function PortalHeader() {
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

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
                <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#f8f6f6] border border-transparent focus-within:border-[#ec1325]/20 focus-within:bg-white transition-all">
                        <div className="text-[#896165] flex border-none items-center justify-center pl-3">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 bg-transparent border-none focus:ring-0 text-[#181112] placeholder:text-[#896165] px-3 text-sm"
                            placeholder="Find family member..."
                        />
                    </div>
                </label>

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
