import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'
import type { CreateNewsData } from '../../features/content/api/contentApi'

export function NewsFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isEditMode = !!id

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateNewsData>({
        defaultValues: {
            is_public: true,
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
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#181112]">
                    {isEditMode ? 'Edit Berita' : 'Tulis Berita Baru'}
                </h1>
                <p className="text-gray-500 text-sm">Bagikan kabar terbaru kepada keluarga.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#e6dbdc] rounded-xl p-6 shadow-sm space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content (Left, 2 cols) */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Berita</label>
                            <input
                                {...register('title', { required: 'Judul berita wajib diisi' })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] outline-none text-lg font-medium"
                                placeholder="Judul artikel..."
                            />
                            {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                            <textarea
                                {...register('content', { required: 'Konten berita wajib diisi' })}
                                rows={15}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] outline-none font-mono text-sm leading-relaxed"
                                placeholder="Tulis isi berita di sini..."
                            />
                            {errors.content && <span className="text-xs text-red-500">{errors.content.message}</span>}
                        </div>
                    </div>

                    {/* Meta Sidebar (Right, 1 col) */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    {...register('category')}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] outline-none bg-white"
                                >
                                    <option value="umum">Umum</option>
                                    <option value="kelahiran">Kelahiran</option>
                                    <option value="lelayu">Lelayu (Duka Cita)</option>
                                    <option value="prestasi">Prestasi</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Publikasi</label>
                                <input
                                    type="datetime-local"
                                    {...register('published_at')}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] outline-none bg-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Kosongkan untuk publish sekarang</p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    {...register('is_public')}
                                    className="w-4 h-4 text-[#ec1325] border-gray-300 rounded focus:ring-[#ec1325]"
                                />
                                <label htmlFor="is_public" className="text-sm font-medium text-gray-700">Publikasikan</label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                                className="w-full px-6 py-3 bg-[#ec1325] text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Berita'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/news')}
                                className="w-full px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
