import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'
import type { CreateEventData } from '../../features/content/api/contentApi'
import RichTextEditor from '../../components/editor/RichTextEditor'
import { EventScheduleManager } from './components/EventScheduleManager'
import { EventSidebarManager } from './components/EventSidebarManager'

export function EventFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isEditMode = !!id

    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateEventData>({
        defaultValues: {
            is_active: true,
            type: 'other',
            year: new Date().getFullYear(),
        }
    })

    // Fetch if Edit Mode
    const { data: eventData } = useQuery({
        queryKey: ['event', id],
        queryFn: () => contentApi.getEvent(Number(id)),
        enabled: isEditMode
    })

    useEffect(() => {
        if (eventData) {
            // Need to format dates for input[type="datetime-local"]
            const formattedData = {
                ...eventData,
                start_date: eventData.start_date ? new Date(eventData.start_date).toISOString().slice(0, 16) : '',
                end_date: eventData.end_date ? new Date(eventData.end_date).toISOString().slice(0, 16) : ''
            }
            reset(formattedData)
        }
    }, [eventData, reset])

    // Mutations
    const createMutation = useMutation({
        mutationFn: contentApi.createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            navigate('/events')
        }
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateEventData) => contentApi.updateEvent(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            queryClient.invalidateQueries({ queryKey: ['event', id] })
            navigate('/events')
        }
    })

    const onSubmit = (data: CreateEventData) => {
        // Ensure year matches start date year optionally, or just submit
        if (isEditMode) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-[#896165]">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-[#181112]">
                        {isEditMode ? 'Edit Acara' : 'Buat Acara Baru'}
                    </h1>
                    <p className="text-sm text-[#896165]">
                        {isEditMode ? 'Perbarui detail acara' : 'Tambahkan jadwal acara baru'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#e6dbdc] rounded-xl p-6 shadow-sm space-y-6">

                {/* Basic Info */}
                <div className="border-b border-[#e6dbdc] pb-6">
                    <h2 className="font-semibold text-[#181112] mb-4">Informasi Dasar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-[#181112] mb-1">Nama Acara *</label>
                            <input
                                {...register('name', { required: 'Nama acara wajib diisi' })}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Contoh: Haul Akbar 2025"
                            />
                            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Tipe Acara</label>
                            <select
                                {...register('type')}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg bg-white focus:outline-none focus:border-[#ec1325]/50"
                            >
                                <option value="festival">Festival / Perayaan</option>
                                <option value="halal_bihalal">Halal Bihalal</option>
                                <option value="youth_camp">Youth Camp / Makrab</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Tahun</label>
                            <input
                                type="number"
                                {...register('year', { required: true, min: 1900, max: 2100 })}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="border-b border-[#e6dbdc] pb-6">
                    <h2 className="font-semibold text-[#181112] mb-4">Waktu Pelaksanaan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Waktu Mulai *</label>
                            <input
                                type="datetime-local"
                                {...register('start_date', { required: 'Waktu mulai wajib diisi' })}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                            {errors.start_date && <span className="text-xs text-red-500 mt-1">{errors.start_date.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Waktu Selesai *</label>
                            <input
                                type="datetime-local"
                                {...register('end_date', { required: 'Waktu selesai wajib diisi' })}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                            />
                            {errors.end_date && <span className="text-xs text-red-500 mt-1">{errors.end_date.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Rundown */}
                <div className="border-b border-[#e6dbdc] pb-6">
                    {isEditMode && eventData ? (
                        <EventScheduleManager eventId={Number(id)} eventStartDate={eventData.start_date} />
                    ) : (
                        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                            <span className="font-semibold">Catatan:</span> Simpan acara terlebih dahulu untuk menambahkan rundown/jadwal detail per hari.
                        </div>
                    )}
                </div>

                {/* Location & Details */}
                <div className="border-b border-[#e6dbdc] pb-6">
                    <h2 className="font-semibold text-[#181112] mb-4">Lokasi & Detail</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Nama Lokasi</label>
                            <input
                                {...register('location_name')}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="Contoh: Pondok Pesantren Langitan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#181112] mb-1">Link Google Maps</label>
                            <input
                                type="url"
                                {...register('location_maps_url')}
                                className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-[#181112] mb-1">Deskripsi Lengkap</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <h2 className="font-semibold text-[#181112] mb-4">Status Publikasi</h2>
                    <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#e6dbdc] rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            {...register('is_active')}
                            className="w-5 h-5 accent-[#ec1325]"
                        />
                        <div>
                            <span className="block text-sm font-medium text-[#181112]">Publikasikan Acara</span>
                            <span className="block text-xs text-[#896165]">Acara akan tampil di portal publik jika diaktifkan.</span>
                        </div>
                    </label>
                </div>

                {/* Sidebar Info */}
                <div className="border-t border-[#e6dbdc] pt-6">
                    <Controller
                        name="meta_data"
                        control={control}
                        render={({ field }) => (
                            <EventSidebarManager
                                items={field.value || []}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="px-4 py-2 border border-[#e6dbdc] rounded-lg text-[#181112] font-medium hover:bg-[#f8f6f6] transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                        className="px-4 py-2 bg-[#ec1325] text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {(isSubmitting || createMutation.isPending || updateMutation.isPending) && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                        {isEditMode ? 'Simpan Perubahan' : 'Buat Acara'}
                    </button>
                </div>
            </form>
        </div>
    )
}
