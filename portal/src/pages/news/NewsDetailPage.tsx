import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClapButton } from '../../components/ui/ClapButton'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { contentApi } from '../../features/content/api/contentApi'

export function NewsDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: news, isLoading } = useQuery({
        queryKey: ['portal', 'news', id],
        queryFn: () => contentApi.getNewsDetail(Number(id)),
        enabled: !!id
    })

    const clapMutation = useMutation({
        mutationFn: () => contentApi.clapNews(Number(id)),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['portal', 'news', id] })
            const previousNews = queryClient.getQueryData(['portal', 'news', id])

            queryClient.setQueryData(['portal', 'news', id], (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    claps: (old.claps || 0) + 1
                }
            })

            return { previousNews }
        },
        onError: (_err, _newTodo, context: any) => {
            if (context?.previousNews) {
                queryClient.setQueryData(['portal', 'news', id], context.previousNews)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['portal', 'news', id] })
        }
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
                <PortalHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-[#896165]">Memuat berita...</div>
                </div>
            </div>
        )
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
                <PortalHeader />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-[#181112]">Berita tidak ditemukan</h2>
                    <button onClick={() => navigate('/')} className="mt-4 text-[#ec1325] hover:underline">
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f6f6] flex flex-col">
            <PortalHeader />

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-10 py-8 md:py-12">
                {/* Breadcrumb / Back */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-1 text-sm font-medium text-[#896165] hover:text-[#ec1325] transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Kembali ke Beranda
                </button>

                {/* News Header */}
                <div className="bg-white border border-[#e6dbdc] rounded-2xl p-8 mb-8 shadow-sm">
                    <div className="flex items-center gap-3 text-sm text-[#896165] mb-4">
                        <span className={`px-2.5 py-1 rounded capitalize font-medium ${news.category === 'lelayu' ? 'bg-black text-white' : 'bg-red-50 text-red-600'
                            }`}>
                            {news.category}
                        </span>
                        <span>•</span>
                        <span>{new Date(news.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-[#181112] mb-6 leading-tight">
                        {news.title}
                    </h1>

                    {news.thumbnail && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 bg-gray-100">
                            <img
                                src={news.thumbnail}
                                alt={news.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3 border-t border-[#e6dbdc] pt-6">
                        <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-[#896165]">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#181112]">{news.author?.name || 'Admin'}</p>
                            <p className="text-xs text-[#896165]">Penulis</p>
                        </div>
                    </div>
                </div>

                {/* News Content */}
                <div className="bg-white border border-[#e6dbdc] rounded-2xl p-8 shadow-sm">
                    <div
                        className="prose prose-lg max-w-none text-[#181112] prose-headings:font-bold prose-headings:text-[#181112] prose-a:text-[#ec1325]"
                        dangerouslySetInnerHTML={{ __html: news.content || '' }}
                    />

                    <div className="mt-12 flex flex-col items-center justify-center gap-2 border-t border-gray-100 pt-8">
                        <ClapButton
                            totalClaps={news.claps || 0}
                            onClap={() => clapMutation.mutate()}
                        />
                        <span className="text-sm text-gray-400 font-medium">Beri tepuk tangan (Like)</span>
                    </div>
                </div>
            </div>

            <footer className="bg-[#181112] text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
                    <p className="text-white/50 text-sm">
                        © {new Date().getFullYear()} Bani Abdul Manan Family Portal
                    </p>
                </div>
            </footer>
        </div>
    )
}
