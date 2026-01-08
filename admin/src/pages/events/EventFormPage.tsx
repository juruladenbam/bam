import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../features/content/api/contentApi'
import type { CreateEventData, SidebarItem } from '../../features/content/api/contentApi'
import RichTextEditor from '../../components/editor/RichTextEditor'
import ImageUploader from '../../components/ImageUploader'
import { EventScheduleManager } from './components/EventScheduleManager'
import { EventSidebarManager } from './components/EventSidebarManager'

export function EventFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isEditMode = !!id

    const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CreateEventData>({
        defaultValues: {
            year: new Date().getFullYear(),
            type: 'festival',
            is_active: false
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
            const formattedData = {
                ...eventData,
                start_date: eventData.start_date.split('T')[0],
                end_date: eventData.end_date.split('T')[0]
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
            navigate('/events')
        }
    })

    const onSubmit = (data: CreateEventData) => {
        if (isEditMode) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
        }
    }

    // Dynamic Header based on Type (Visual only)
    const eventType = watch('type')
    const typeLabel = {
        'festival': 'Festival Haul',
        'halal_bihalal': 'Halal Bihalal',
        'youth_camp': 'Youth Camp',
        'other': 'Acara Lainnya'
    }[eventType] || 'Acara Baru'

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Kembali
                    </button>
                    <h1 className="text-2xl font-bold text-[#181112]">
                        {isEditMode ? `Edit ${typeLabel}` : `Buat ${typeLabel}`}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                        className="px-6 py-2 text-sm font-medium text-white bg-[#ec1325] rounded-lg hover:bg-[#d01020] disabled:opacity-70 flex items-center gap-2 shadow-sm shadow-red-200"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Acara'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Content (Left, 2 cols) */}
                <div className="lg:col-span-2 space-y-8 bg-white p-6 md:p-8 rounded-xl border border-[#e6dbdc] shadow-sm">

                    {/* Basic Info */}
                    <div className="border-b border-[#e6dbdc] pb-6">
                        <h2 className="font-semibold text-[#181112] mb-4">Informasi Dasar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[#181112] mb-1">Nama Acara</label>
                                <input
                                    {...register('name', { required: 'Nama acara wajib diisi' })}
                                    className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                    placeholder="Contoh: Haul Akbar 2025"
                                />
                                {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#181112] mb-1">Tahun</label>
                                <input
                                    type="number"
                                    {...register('year', { required: true, min: 1900, max: 2100 })}
                                    className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#181112] mb-1">Jenis Acara</label>
                                <div className="relative">
                                    <select
                                        {...register('type')}
                                        className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50 appearance-none bg-white"
                                    >
                                        <option value="festival">Festival Haul</option>
                                        <option value="halal_bihalal">Halal Bihalal</option>
                                        <option value="youth_camp">Youth Camp</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-500 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    {...register('start_date', { required: 'Tanggal mulai wajib diisi' })}
                                    className="w-full px-4 py-2 border border-[#e6dbdc] rounded-lg focus:outline-none focus:border-[#ec1325]/50"
                                />
                                {errors.start_date && <span className="text-xs text-red-500 mt-1">{errors.start_date.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#181112] mb-1">Tanggal Selesai</label>
                                <input
                                    type="date"
                                    {...register('end_date', { required: 'Tanggal selesai wajib diisi' })}
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
                                <Controller
                                    name="thumbnail"
                                    control={control}
                                    render={({ field }) => (
                                        <ImageUploader
                                            value={field.value}
                                            onChange={field.onChange}
                                            folder="events"
                                            label="Thumbnail Image"
                                        />
                                    )}
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
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            placeholder="Deskripsi acara..."
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar (Right) - Meta Data & Status */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Status Card */}
                    <div className="bg-white p-5 rounded-xl border border-[#e6dbdc] shadow-sm">
                        <h3 className="font-semibold text-[#181112] mb-4">Status Publikasi</h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                {...register('is_active')}
                                className="w-4 h-4 text-[#ec1325] border-gray-300 rounded focus:ring-[#ec1325]"
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer select-none">
                                Tampilkan Acara (Aktif)
                            </label>
                        </div>
                    </div>

                    {/* Meta Data Manager (Sidebar Items) */}
                    <Controller
                        name="meta_data"
                        control={control}
                        render={({ field }) => (
                            <EventSidebarManager
                                items={(field.value as SidebarItem[]) || []}
                                onChange={field.onChange}
                            />
                        )}
                    />

                </div>

            </div>
        </form>
    )
}
