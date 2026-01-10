import React from 'react'

interface ServiceCardProps {
    href: string
    title: string
    description: string
    icon: string
    color: 'amber' | 'pink'
    variant?: 'compact' | 'full'
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    href,
    title,
    description,
    icon,
    color,
    variant = 'full'
}) => {
    // Color configurations
    const colorConfig = {
        amber: {
            bg: 'bg-amber-50',
            bgHover: 'group-hover:bg-amber-500',
            text: 'text-amber-500',
            textHover: 'group-hover:text-white',
            border: 'border-amber-100',
            gradientBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
            gradientHeader: 'bg-gradient-to-br from-amber-500 to-orange-600',
            hoverText: 'group-hover:text-amber-600',
            linkText: 'text-amber-600'
        },
        pink: {
            bg: 'bg-pink-50',
            bgHover: 'group-hover:bg-pink-500',
            text: 'text-pink-500',
            textHover: 'group-hover:text-white',
            border: 'border-pink-100',
            gradientBg: 'bg-gradient-to-br from-pink-50 to-rose-50',
            gradientHeader: 'bg-gradient-to-br from-pink-500 to-rose-600',
            hoverText: 'group-hover:text-pink-600',
            linkText: 'text-pink-600'
        }
    }

    const theme = colorConfig[color]

    if (variant === 'compact') {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-[#e6dbdc] rounded-xl p-4 hover:shadow-md hover:border-[#ec1325]/30 transition-all group block"
            >
                <div className={`size-10 rounded-lg ${theme.bg} flex items-center justify-center mb-3 ${theme.bgHover} transition-colors`}>
                    <span className={`material-symbols-outlined ${theme.text} ${theme.textHover} transition-colors`}>{icon}</span>
                </div>
                <h3 className={`font-bold text-[#181112] text-sm ${theme.hoverText} transition-colors`}>{title}</h3>
                <p className="text-xs text-[#896165] mt-1">{description}</p>
            </a>
        )
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${theme.gradientBg} rounded-xl shadow-md overflow-hidden border ${theme.border} hover:shadow-lg transition-all group block`}
        >
            <div className={`${theme.gradientHeader} h-32 flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white text-5xl">{icon}</span>
            </div>
            <div className="p-6">
                <h3 className={`text-xl font-bold text-[#181112] mb-2 ${theme.hoverText} transition-colors`}>{title}</h3>
                <p className="text-[#896165] text-sm mb-4">
                    {description}
                </p>
                <span className={`inline-flex items-center gap-1 ${theme.linkText} font-medium text-sm group-hover:gap-2 transition-all`}>
                    Kunjungi <span className="material-symbols-outlined text-base">arrow_forward</span>
                </span>
            </div>
        </a>
    )
}
