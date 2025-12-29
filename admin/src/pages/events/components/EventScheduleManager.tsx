import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { contentApi } from '../../../features/content/api/contentApi'
import type { EventSchedule, CreateScheduleData } from '../../../features/content/api/contentApi'

interface Props {
    eventId: number
    eventStartDate?: string
}

export function EventScheduleManager({ eventId, eventStartDate }: Props) {
    const queryClient = useQueryClient()
    const [isAdding, setIsAdding] = useState(false)


    // Fetch schedules via event detail
    // Actually getEvent already includes schedules if we updated the repository correctly
    // But we might want to refresh just this part or use specific query?
    // Let's rely on 'event' query invalidation for now or refetch event

    // We can use the cached event data if available, but for updates we need fresh data.
    // Let's assume the parent component invalidates 'event' query on success, 
    // but here we are managing sub-resources.
    // We should probably have a separate query for schedules if we want granular updates,
    // OR just invalidate the event query.

    // Let's use the event data passed down or fetch it again?
    // Parent fetches event. Let's re-fetch here to be safe and independent?
    // No, better to use the cache key.

    const { data: event } = useQuery({
        queryKey: ['event', String(eventId)],
        queryFn: () => contentApi.getEvent(eventId)
    })

    const schedules = event?.schedules || []

    // Mutations
    const createScheduleMutation = useMutation({
        mutationFn: (data: CreateScheduleData) => contentApi.createSchedule(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', String(eventId)] })
            setIsAdding(false)
            reset()
        }
    })

    const deleteScheduleMutation = useMutation({
        mutationFn: (scheduleId: number) => contentApi.deleteSchedule(eventId, scheduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', String(eventId)] })
        }
    })

    const { register, handleSubmit, reset } = useForm<CreateScheduleData>({
        defaultValues: {
            day_sequence: 1
        }
    })

    const onSubmit = (data: CreateScheduleData) => {
        createScheduleMutation.mutate(data)
    }

    const formatDate = (daySequence: number, time?: string) => {
        if (!eventStartDate) return `Day ${daySequence}`
        const date = new Date(eventStartDate)
        date.setDate(date.getDate() + (daySequence - 1))
        const dateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
        return time ? `${time} - ${dateStr}` : dateStr
    }

    // Group by day
    const groupedSchedules = schedules.reduce((acc: any, curr: EventSchedule) => {
        const day = curr.day_sequence
        if (!acc[day]) acc[day] = []
        acc[day].push(curr)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#181112]">Rundown Acara</h3>
                <button
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                    className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isAdding
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-[#ec1325]/10 text-[#ec1325] hover:bg-[#ec1325]/20'
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{isAdding ? 'close' : 'add'}</span>
                    {isAdding ? 'Batal' : 'Tambah Jadwal'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-gray-50 border border-[#e6dbdc] rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Hari Ke-</label>
                            <input
                                type="number"
                                min={1}
                                {...register('day_sequence', { required: true, min: 1 })}
                                className="w-full px-3 py-2 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Judul Kegiatan</label>
                            <input
                                {...register('title', { required: true })}
                                className="w-full px-3 py-2 border rounded text-sm"
                                placeholder="Contoh: Pembukaan"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Jam Mulai</label>
                            <input
                                type="time"
                                {...register('time_start', { required: true })}
                                className="w-full px-3 py-2 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Jam Selesai (Opsional)</label>
                            <input
                                type="time"
                                {...register('time_end')}
                                className="w-full px-3 py-2 border rounded text-sm"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Deskripsi (Opsional)</label>
                            <textarea
                                {...register('description')}
                                className="w-full px-3 py-2 border rounded text-sm"
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 border border-[#e6dbdc] rounded-lg text-[#181112] font-medium hover:bg-[#f8f6f6] transition-colors text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={createScheduleMutation.isPending}
                            className="bg-[#ec1325] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
                        >
                            {createScheduleMutation.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {Object.keys(groupedSchedules).sort().map((day: any) => (
                    <div key={day} className="border border-[#e6dbdc] rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-[#e6dbdc] flex items-center justify-between">
                            <span className="font-semibold text-[#181112]">Hari ke-{day} <span className="text-[#896165] font-normal text-sm">({formatDate(parseInt(day))})</span></span>
                        </div>
                        <div className="divide-y divide-[#e6dbdc]">
                            {groupedSchedules[day].map((item: EventSchedule) => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                    <div className="min-w-[100px] text-sm text-[#896165] font-mono">
                                        {item.time_start.slice(0, 5)} {item.time_end ? `- ${item.time_end.slice(0, 5)}` : ''}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-[#181112]">{item.title}</h4>
                                        {item.description && <p className="text-sm text-[#896165] mt-1">{item.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm('Hapus jadwal ini?')) {
                                                deleteScheduleMutation.mutate(item.id)
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {schedules.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-[#896165] bg-gray-50 rounded-lg border border-dashed border-[#e6dbdc]">
                        Belum ada jadwal acara.
                    </div>
                )}
            </div>
        </div>
    )
}
