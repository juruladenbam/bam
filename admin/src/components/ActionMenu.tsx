import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ActionMenuProps {
    children: React.ReactNode;
}

export function ActionMenu({ children }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({})

    const updatePosition = () => {
        if (buttonRef.current && isOpen) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuStyles({
                position: 'fixed',
                top: rect.bottom + 4,
                // Align to the right edge of the button
                right: window.innerWidth - rect.right,
                zIndex: 9999,
            })
        }
    }

    useEffect(() => {
        if (isOpen) {
            updatePosition()
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true)
            window.removeEventListener('resize', updatePosition)
        }
    }, [isOpen])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="inline-block text-left">
            {/* Mobile View (3 dots) */}
            <div className="md:hidden">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(!isOpen)
                    }}
                    className={`p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center ${isOpen ? 'bg-gray-100' : ''}`}
                >
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </div>

            {/* Mobile Dropdown Menu via Portal */}
            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={menuStyles}
                    className="md:hidden w-auto min-w-[140px] origin-top-right bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] border border-gray-100"
                >
                    <div className="p-2 flex flex-col gap-1" onClick={() => setIsOpen(false)}>
                        {children}
                    </div>
                </div>,
                document.body
            )}

            {/* Desktop View (Inline Actions) */}
            <div className="hidden md:flex items-center justify-end gap-1">
                {children}
            </div>
        </div>
    )
}

