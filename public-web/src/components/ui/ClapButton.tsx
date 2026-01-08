import { useState, useRef } from 'react'

interface ClapButtonProps {
    totalClaps: number
    onClap: () => void
}

export function ClapButton({ totalClaps, onClap }: ClapButtonProps) {
    const [localClaps, setLocalClaps] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleClick = () => {
        setLocalClaps(prev => prev + 1)
        onClap()

        setIsAnimating(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            setIsAnimating(false)
        }, 1000)
    }

    return (
        <div className="relative flex flex-col items-center">
            {/* Floating Badge Animation */}
            <div
                key={localClaps}
                className={`absolute -top-12 pointer-events-none transition-all duration-700 ease-out transform ${isAnimating ? 'opacity-0 -translate-y-8 scale-150' : 'opacity-0 translate-y-0 scale-100'
                    }`}
            >
                {isAnimating && (
                    <span className="bg-[#ec1325] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        +1
                    </span>
                )}
            </div>

            <button
                onClick={handleClick}
                className={`
                    group relative size-16 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${isAnimating
                        ? 'bg-[#ec1325]/5 border-[#ec1325] scale-110 shadow-[0_0_20px_rgba(236,19,37,0.3)]'
                        : 'bg-white border-[#e6dbdc] hover:border-[#ec1325] hover:bg-[#ec1325]/5'
                    }
                `}
            >
                <span
                    className={`text-[32px] transition-transform duration-200 select-none ${isAnimating ? 'scale-110' : 'scale-100 group-hover:scale-110'
                        }`}
                >
                    👏
                </span>

                {/* Ripple Effect Ring (Pseudo-element visualized) */}
                {isAnimating && (
                    <span className="absolute inset-0 rounded-full border border-[#ec1325] animate-ping opacity-75"></span>
                )}
            </button>

            <div className="mt-3 font-semibold text-[#181112]">
                {totalClaps}
            </div>
        </div>
    )
}
