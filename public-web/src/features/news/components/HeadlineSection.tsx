import { useNewsHeadlines } from '../hooks/useNews';
import { Link } from 'react-router-dom';

export function HeadlineSection() {
    const { data, isLoading } = useNewsHeadlines();
    const headlines = data?.data || [];

    if (isLoading) return (
        <section className="py-12 bg-white border-b border-[#e6dbdc]">
            <div className="container mx-auto px-4 max-w-[1200px]">
                <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[400px] bg-gray-200 rounded-2xl animate-pulse"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                        <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                        <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );

    if (headlines.length === 0) return null;

    const mainHeadline = headlines[0];
    const sideHeadlines = headlines.slice(1, 4);

    return (
        <section className="py-12 bg-white border-b border-[#e6dbdc]">
            <div className="container mx-auto px-4 max-w-[1200px]">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-[#181112]">
                    <span className="material-symbols-outlined text-[#ec1325]">breaking_news_alt_1</span>
                    Headline Berita
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Headline */}
                    <Link
                        to={`/berita/${mainHeadline.slug}`}
                        className="lg:col-span-2 group relative h-[400px] rounded-2xl overflow-hidden shadow-md block"
                    >
                        <img
                            src={mainHeadline.thumbnail_url || 'https://placehold.co/800x400?text=No+Image'}
                            alt={mainHeadline.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-8 flex flex-col justify-end">
                            <span className="inline-block px-3 py-1 bg-[#ec1325] text-white text-xs font-bold rounded-full mb-3 w-fit">
                                {mainHeadline.category}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:underline decoration-white/50 underline-offset-4">
                                {mainHeadline.title}
                            </h3>
                            {mainHeadline.published_at && (
                                <p className="text-white/70 text-sm">
                                    {new Date(mainHeadline.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                </p>
                            )}
                        </div>
                    </Link>

                    {/* Side Headlines */}
                    <div className="flex flex-col gap-4">
                        {sideHeadlines.map(news => (
                            <Link
                                key={news.id}
                                to={`/berita/${news.slug}`}
                                className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                            >
                                <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={news.thumbnail_url || 'https://placehold.co/200x200?text=No+Image'}
                                        alt={news.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col h-full">
                                    <span className="text-[10px] font-bold text-[#ec1325] uppercase tracking-wider mb-1 block">
                                        {news.category}
                                    </span>
                                    <h4 className="font-bold text-[#181112] leading-snug line-clamp-2 group-hover:text-[#ec1325] transition-colors mb-2">
                                        {news.title}
                                    </h4>

                                    {news.excerpt && (
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                                            {news.excerpt}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 text-[11px] text-[#896165] mt-auto">
                                        {news.published_at && (
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {new Date(news.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        )}

                                        {news.claps > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-[12px]">👏</span>
                                                <span className="font-medium">{news.claps}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
