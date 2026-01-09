import { useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNewsItem, newsApi } from '@/features/news';
import SEO from '@/components/SEO';
import { ClapButton } from '@/components/ui/ClapButton';


export default function NewsDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading, error } = useNewsItem(slug || '');

    const queryClient = useQueryClient();

    const clapMutation = useMutation({
        mutationFn: () => {
            if (!data?.data?.id) throw new Error("News ID not found");
            return newsApi.clap(data.data.id);
        },
        onMutate: async () => {
            const queryKey = ['news', 'public', slug];
            await queryClient.cancelQueries({ queryKey });
            const previousNews = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old || !old.data) return old;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        claps: (old.data.claps || 0) + 1
                    }
                };
            });

            return { previousNews };
        },
        onError: (_err, _newTodo, context: any) => {
            if (context?.previousNews) {
                queryClient.setQueryData(['news', 'public', slug], context.previousNews);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['news', 'public', slug] });
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] py-16">
                <div className="container mx-auto px-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#ec1325]/30">article</span>
                    <h1 className="text-2xl font-bold text-[#181112] mt-4">Berita Tidak Ditemukan</h1>
                    <p className="text-[#896165] mt-2">Berita yang Anda cari tidak tersedia.</p>
                    <Link
                        to="/berita"
                        className="inline-block mt-6 px-6 py-3 bg-[#ec1325] text-white rounded-lg font-semibold hover:bg-[#c91020] transition-colors"
                    >
                        Kembali ke Daftar Berita
                    </Link>
                </div>
            </div>
        );
    }

    const news = data.data;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <SEO
                title={news.title}
                description={news.excerpt || news.content?.substring(0, 160).replace(/<[^>]*>/g, '')}
                url={`/berita/${news.slug}`}
                image={news.thumbnail_url}
                type="article"
            />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#181112] to-[#3d2a2c] text-white py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Link
                        to="/berita"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Kembali ke Berita
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#ec1325] text-white text-xs font-bold rounded-full uppercase">
                            {news.category}
                        </span>
                        {news.published_at && (
                            <span className="text-white/60 text-sm">
                                {formatDate(news.published_at)}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">{news.title}</h1>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    {news.thumbnail_url && (
                        <img
                            src={news.thumbnail_url}
                            alt={news.title}
                            className="w-full rounded-xl shadow-lg mb-8 -mt-16 relative z-10"
                        />
                    )}

                    <article className="bg-white rounded-xl p-8 shadow-sm border border-[#e6dbdc]">
                        {news.excerpt && (
                            <p className="text-lg text-[#896165] italic border-l-4 border-[#ec1325] pl-4 mb-8">
                                {news.excerpt}
                            </p>
                        )}

                        <div
                            className="prose prose-lg max-w-none prose-headings:text-[#181112] prose-p:text-[#3d2a2c] prose-a:text-[#ec1325]"
                            dangerouslySetInnerHTML={{ __html: news.content }}
                        />

                        <div className="mt-12 flex flex-col items-center justify-center gap-2 border-t border-[#e6dbdc] pt-8">
                            <ClapButton
                                totalClaps={news.claps || 0}
                                onClap={() => clapMutation.mutate()}
                            />
                            <span className="text-sm text-gray-400 font-medium">Beri tepuk tangan</span>
                        </div>
                    </article>

                    {/* Share */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <span className="text-[#896165] text-sm">Bagikan:</span>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(news.title + ' - ' + window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </a>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
