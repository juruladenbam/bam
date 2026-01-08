import { Link } from 'react-router-dom'
import type { Event } from '../api/eventApi'

interface EventCardProps {
    event: Event
    variant?: 'default' | 'compact'
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
    const gradients: Record<string, string> = {
        'Festival BAM': 'from-[#ec1325] to-[#8b0a13]',
        'Halal Bihalal': 'from-amber-500 to-amber-700',
        'Merajut Cinta': 'from-blue-500 to-blue-700',
    }

    const icons: Record<string, string> = {
        'Festival BAM': 'mosque',
        'Halal Bihalal': 'handshake',
        'Merajut Cinta': 'camping',
    }

    const gradient = gradients[event.name] || 'from-[#ec1325] to-[#8b0a13]'
    const icon = icons[event.name] || 'event'

    const isPast = new Date(event.end_date) < new Date()

    if (variant === 'compact') {
        return (
            <Link
                to={`/acara/${event.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e6dbdc] hover:border-[#ec1325] hover:shadow-md transition-all group"
            >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="material-symbols-outlined text-white text-xl">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#181112] truncate group-hover:text-[#ec1325] transition-colors">
                        {event.name} {event.year}
                    </h3>
                    <p className="text-xs text-[#896165]">
                        {new Date(event.start_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                        })}
                        {event.location_name && ` • ${event.location_name}`}
                    </p>
                </div>
                <span className="material-symbols-outlined text-[#896165] group-hover:text-[#ec1325] transition-colors">
                    arrow_forward
                </span>
            </Link>
        )
    }

    return (
        <Link
            to={`/acara/${event.id}`}
            className={`block bg-white rounded-xl shadow-sm overflow-hidden border border-[#e6dbdc] hover:shadow-lg hover:border-[#ec1325]/30 transition-all group ${isPast ? 'opacity-75' : ''}`}
        >
            <div className={`bg-gradient-to-br ${gradient} h-32 flex items-center justify-center relative`}>
                {event.thumbnail ? (
                    <img
                        src={event.thumbnail}
                        alt={event.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="material-symbols-outlined text-white text-5xl group-hover:scale-110 transition-transform">
                        {icon}
                    </span>
                )}
                {isPast && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">
                            Selesai
                        </span>
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-[#896165] mb-2">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span>
                        {new Date(event.start_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-[#181112] mb-2 group-hover:text-[#ec1325] transition-colors">
                    {event.name} {event.year}
                </h3>
                <p className="text-[#896165] text-sm line-clamp-2">{event.description}</p>
                {event.location_name && (
                    <div className="flex items-center gap-1 text-xs text-[#896165] mt-3">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{event.location_name}</span>
                    </div>
                )}
            </div>
        </Link>
    )
}

export default EventCard
