import { Link } from 'react-router-dom';
import type { Event } from '@/lib/types';

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const gradients: Record<string, string> = {
        'Festival BAM': 'from-[#ec1325] to-[#8b0a13]',
        'Halal Bihalal': 'from-amber-500 to-amber-700',
        'Merajut Cinta': 'from-blue-500 to-blue-700',
    };

    const icons: Record<string, string> = {
        'Festival BAM': 'mosque',
        'Halal Bihalal': 'handshake',
        'Merajut Cinta': 'camping',
    };

    const gradient = gradients[event.name] || 'from-gray-500 to-gray-700';
    const icon = icons[event.name] || 'event';

    return (
        <Link
            to={`/acara/${event.slug}`}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e6dbdc] hover:shadow-lg transition-shadow group"
        >
            <div className={`bg-gradient-to-br ${gradient} h-32 flex items-center justify-center`}>
                {event.thumbnail_url ? (
                    <img
                        src={event.thumbnail_url}
                        alt={event.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="material-symbols-outlined text-white text-5xl group-hover:scale-110 transition-transform">
                        {icon}
                    </span>
                )}
            </div>
            <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-[#896165] mb-2">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span>{new Date(event.start_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}</span>
                </div>
                <h3 className="text-xl font-bold text-[#181112] mb-2 group-hover:text-[#ec1325] transition-colors">
                    {event.name}
                </h3>
                <p className="text-[#896165] text-sm line-clamp-2">
                    {event.description}
                </p>
                {event.location && (
                    <div className="flex items-center gap-1 text-xs text-[#896165] mt-3">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{event.location}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

export default EventCard;
