import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'
import type { CreateNewsData } from '../../features/content/api/contentApi'
import RichTextEditor from '../../components/editor/RichTextEditor'
import ImageUploader from '../../components/ImageUploader'

export function NewsFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isEditMode = !!id

    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateNewsData>({
        defaultValues: {
            is_public: true,
            is_headline: false,
            category: 'umum',
        }
    })

    // Fetch if Edit Mode
    const { data: newsData } = useQuery({
        queryKey: ['news', id],
        queryFn: () => contentApi.getNewsDetail(Number(id)),
        enabled: isEditMode
    })

    useEffect(() => {
        if (newsData) {
            const formattedData = {
                ...newsData,
                published_at: newsData.published_at ? new Date(newsData.published_at).toISOString().slice(0, 16) : ''
            }
            reset(formattedData)
        }
    }, [newsData, reset])

    // Mutations
    const createMutation = useMutation({
        mutationFn: contentApi.createNews,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] })
            navigate('/news')
        }
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateNewsData) => contentApi.updateNews(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] })
            navigate('/news')
        }
    })

    const onSubmit = (data: CreateNewsData) => {
        if (isEditMode) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">

            {/* Main Editor Area - Distinct "Paper" Style */}
            <div className="flex-1 w-full order-2 md:order-1">
                <div className="min-h-[80vh] bg-white rounded-2xl p-8 md:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 transition-shadow focus-within:shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
                    {/* Header Controls (Back button) */}
                    <div className="mb-8">
                        <button
                            type="button"
                            onClick={() => navigate('/news')}
                            className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Kembali
                        </button>
                    </div>

                    {/* Title Input - Huge & Clean */}
                    <div className="relative mb-8 group">
                        <textarea
                            {...register('title', { required: 'Judul berita wajib diisi' })}
                            className="w-full text-4xl md:text-5xl font-bold text-[#181112] placeholder-gray-200 border-none focus:ring-0 outline-none focus:outline-none shadow-none focus:shadow-none p-0 bg-transparent resize-none overflow-hidden leading-tight"
                            placeholder="Judul Berita..."
                            rows={2}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                            }}
                        />
                        {errors.title && <span className="absolute -bottom-6 left-0 text-sm text-red-500 font-medium">{errors.title.message}</span>}
                    </div>

                    {/* Content Input - Rich Text Editor */}
                    <div className="relative">
                        <Controller
                            name="content"
                            control={control}
                            rules={{ required: 'Konten berita wajib diisi' }}
                            render={({ field }) => (
                                <div className="prose prose-lg max-w-none">
                                    {/* The RichTextEditor includes the full ToolbarPlugin internally */}
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="Mulai tulis ceritamu disini..."
                                        variant="ghost"
                                    />
                                </div>
                            )}
                        />
                        {errors.content && <span className="absolute -top-6 right-0 text-sm text-red-500 font-medium">{errors.content.message}</span>}
                    </div>
                </div>
            </div>

            {/* Sidebar Tools - Floating Panel */}
            <div className="w-full md:w-80 shrink-0 order-1 md:order-2 space-y-6 md:sticky md:top-6">

                {/* Submit Action Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#181112]">Publikasi</h3>
                        <div className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                        className="w-full py-3 px-4 bg-[#181112] text-white rounded-lg hover:bg-black transition-all hover:shadow-lg disabled:opacity-70 disabled:hover:shadow-none font-medium flex items-center justify-center gap-2 group"
                    >
                        {isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Update Berita' : 'Terbitkan Berita')}
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">send</span>
                    </button>

                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_public"
                                {...register('is_public')}
                                className="w-4 h-4 text-[#181112] border-gray-300 rounded focus:ring-black"
                            />
                            <label htmlFor="is_public" className="text-sm text-gray-600 cursor-pointer select-none">
                                Tampilkan ke Publik
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_headline"
                                {...register('is_headline')}
                                className="w-4 h-4 text-[#ec1325] border-gray-300 rounded focus:ring-[#ec1325]"
                            />
                            <label htmlFor="is_headline" className="text-sm text-gray-600 cursor-pointer select-none">
                                Jadikan Headline
                            </label>
                        </div>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-5">
                    <h3 className="font-semibold text-[#181112] text-sm uppercase tracking-wider text-gray-400">Pengaturan</h3>

                    <div className="space-y-4">
                        <div>
                            <Controller
                                name="thumbnail"
                                control={control}
                                render={({ field }) => (
                                    <ImageUploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        folder="news"
                                        label="Thumbnail Image"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Deskripsi Singkat</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-[#181112] focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-400 resize-none"
                                placeholder="Ringkasan untuk preview..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Kategori</label>
                            <div className="relative">
                                <select
                                    {...register('category')}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-[#181112] focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    <option value="umum">📢 Umum</option>
                                    <option value="kelahiran">👶 Kelahiran</option>
                                    <option value="lelayu">🥀 Lelayu</option>
                                    <option value="prestasi">🏆 Prestasi</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Tanggal Tayang</label>
                            <input
                                type="datetime-local"
                                {...register('published_at')}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-[#181112] focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </form>
    )
}
