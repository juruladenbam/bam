import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'
import type { CreateMediaData } from '../../features/content/api/contentApi'

export function MediaUploadPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateMediaData>({
        defaultValues: {
            type: 'image',
            year: new Date().getFullYear()
        }
    })

    const createMutation = useMutation({
        mutationFn: contentApi.createMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] })
            navigate('/media')
        }
    })

    const onSubmit = (data: CreateMediaData) => {
        createMutation.mutate(data)
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#181112]">Upload Media</h1>
                <p className="text-gray-500 text-sm">Tambahkan foto atau video ke arsip.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#e6dbdc] rounded-xl p-6 shadow-sm space-y-6">

                {/* Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Media</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="image"
                                {...register('type')}
                                className="text-[#ec1325] focus:ring-[#ec1325]"
                            />
                            <span>Foto</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="video"
                                {...register('type')}
                                className="text-[#ec1325] focus:ring-[#ec1325]"
                            />
                            <span>Video (Link)</span>
                        </label>
                    </div>
                </div>

                {/* URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL File / Link</label>
                    <input
                        type="url"
                        {...register('file_url', { required: 'URL wajib diisi' })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] outline-none"
                        placeholder="https://example.com/image.jpg"
                    />
                    {errors.file_url && <span className="text-xs text-red-500">{errors.file_url.message}</span>}
                    <p className="text-xs text-gray-500 mt-1">Masukkan link direct ke gambar atau video.</p>
                </div>

                {/* Caption */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Caption)</label>
                    <textarea
                        {...register('caption')}
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] outline-none"
                        placeholder="Deskripsi singkat..."
                    />
                </div>

                {/* Year */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Dokumentasi</label>
                    <input
                        type="number"
                        {...register('year', { min: 1900, max: 2100 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ec1325]/20 focus:border-[#ec1325] outline-none"
                    />
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/media')}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || createMutation.isPending}
                        className="flex-1 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Media'}
                    </button>
                </div>
            </form>
        </div>
    )
}
