import { Link } from 'react-router-dom';
import type { NewsItem } from '@/lib/types';

interface NewsCardProps {
    news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
    return (
        <Link
            to={`/berita/${news.slug}`}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e6dbdc] hover:shadow-lg transition-shadow group"
        >
            {news.thumbnail_url ? (
                <div className="h-48 overflow-hidden">
                    <img
                        src={news.thumbnail_url}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="h-48 bg-gradient-to-br from-[#ec1325]/10 to-[#ec1325]/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-[#ec1325]/30">article</span>
                </div>
            )}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-[#ec1325]/10 text-[#ec1325] rounded-full">
                        {news.category}
                    </span>
                    {news.published_at && (
                        <span className="text-xs text-[#896165]">
                            {new Date(news.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-[#181112] mb-2 group-hover:text-[#ec1325] transition-colors line-clamp-2">
                    {news.title}
                </h3>
                {news.excerpt && (
                    <p className="text-[#896165] text-sm line-clamp-3">
                        {news.excerpt}
                    </p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-[#896165]">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                        {news.claps || 0}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default NewsCard;
