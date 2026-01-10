import { useState } from 'react'
import { useCalendar } from '../../features/calendar/useCalendar'
import type { CalendarDay, CalendarEvent } from '../../features/calendar/useCalendar'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { format, addMonths, subMonths } from 'date-fns'
import { id } from 'date-fns/locale'

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const toArabicNumerals = (num: number | string): string => {
    return String(num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}

export function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const { data, isLoading, error } = useCalendar(year, month)

    const goToPreviousMonth = () => {
        setCurrentDate(prev => subMonths(prev, 1))
        setSelectedDate(null)
    }

    const goToNextMonth = () => {
        setCurrentDate(prev => addMonths(prev, 1))
        setSelectedDate(null)
    }

    // const goToToday = () => {
    //     const now = new Date()
    //     setCurrentDate(now)
    //     setSelectedDate(format(now, 'yyyy-MM-dd'))
    // }

    // Get events for a specific date
    const getEventsForDate = (dateStr: string): CalendarEvent[] => {
        if (!data) return []
        const events: CalendarEvent[] = []

        data.events.family.forEach(e => {
            if (e.start_date && e.end_date) {
                // Multi-day event check
                if (dateStr >= e.start_date && dateStr <= e.end_date) {
                    events.push(e)
                }
            } else if (e.date === dateStr) {
                // Single day fallback
                events.push(e)
            }
        })
        data.events.islamic.forEach(e => {
            if (e.date === dateStr) events.push(e)
        })
        data.events.commemorations.forEach(e => {
            if (e.date === dateStr) events.push(e)
        })

        return events
    }

    // Build calendar grid with padding for first day
    const buildCalendarGrid = (): (CalendarDay | null)[] => {
        if (!data) return []

        const firstDay = new Date(year, month - 1, 1).getDay()
        const grid: (CalendarDay | null)[] = []

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            grid.push(null)
        }

        // Add actual days
        data.days.forEach(day => {
            grid.push(day)
        })

        return grid
    }

    const getEventTypeColor = (type: string): string => {
        switch (type) {
            case 'family':
                return 'bg-emerald-500'
            case 'islamic':
                return 'bg-blue-500'
            case 'commemoration':
                return 'bg-purple-500'
            default:
                return 'bg-gray-500'
        }
    }

    const isToday = (dateStr: string): boolean => {
        const today = format(new Date(), 'yyyy-MM-dd')
        return dateStr === today
    }

    return (
        <MobileLayout>
            <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className='text-center'>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {MONTH_NAMES[month - 1]} {year}
                        </h1>
                        {data && (
                            <p className="text-sm text-gray-600">
                                {data.hijri_month.month_name} {data.hijri_month.year} H
                            </p>
                        )}
                    </div>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-gray-600">Acara Keluarga</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-gray-600">Hari Besar Islam</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-gray-600">Peringatan Kematian</span>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec1325]"></div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                        Gagal memuat data kalender
                    </div>
                )}

            </div>

            {/* Calendar Grid (Full Width Mobile, Contained Desktop) */}
            {data && (
                <div className="w-full md:max-w-4xl md:mx-auto md:px-4 mb-6">
                    <div className="bg-white shadow-sm border-y md:border md:rounded-xl border-gray-200 overflow-hidden select-none">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                            {DAY_NAMES.map((day, i) => (
                                <div key={day} className={`py-3 text-center text-sm font-semibold ${i === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7">
                            {buildCalendarGrid().map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="min-h-[100px] bg-gray-50 border-b border-r border-gray-100"></div>
                                }

                                const events = getEventsForDate(day.date)
                                const today = isToday(day.date)
                                const isSelected = selectedDate === day.date
                                const isSunday = new Date(day.date).getDay() === 0

                                return (
                                    <div
                                        key={day.date}
                                        onClick={() => setSelectedDate(isSelected ? null : day.date)}
                                        className={`min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors
                                            ${today ? 'bg-[#ec1325]/15' : ''}
                                            ${isSelected ? 'bg-amber-50 ring-2 ring-inset ring-[#ec1325] z-10' : 'hover:bg-gray-50'}
                                        `}
                                    >
                                        {/* Date Numbers */}
                                        <div className="flex items-start justify-between mb-1">
                                            <span className={`text-lg font-semibold ${today ? '' : isSunday ? 'text-red-500' : 'text-gray-900'}`}>
                                                {day.day}
                                            </span>
                                            <span className="text-xl text-emerald-600 font-serif leading-none mt-1">
                                                {toArabicNumerals(day.hijri.day)}
                                            </span>
                                        </div>

                                        {/* Weton */}
                                        <div className="text-[10px] text-gray-400 mb-1">
                                            {day.pasaran}
                                        </div>

                                        {/* Events Preview */}
                                        <div className="space-y-0.5">
                                            {events.slice(0, 2).map((event, i) => (
                                                <div
                                                    key={`${event.type}-${i}`}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                                                    title={event.title || event.label}
                                                >
                                                    {event.title || event.label}
                                                </div>
                                            ))}
                                            {events.length > 2 && (
                                                <div className="text-[10px] text-gray-500">
                                                    +{events.length - 2} lainnya
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Event Details Section */}
            {data && (
                <div className="max-w-4xl mx-auto px-4 pb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {selectedDate
                                ? `Agenda ${format(new Date(selectedDate), 'd MMMM yyyy', { locale: id })}`
                                : 'Semua Agenda Bulan Ini'
                            }
                        </h2>
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-sm text-[#ec1325] hover:underline"
                            >
                                Lihat Semua
                            </button>
                        )}
                    </div>

                    {/* Event List */}
                    {(() => {
                        let displayEvents: CalendarEvent[] = []

                        // Expand family events (handle ranges)
                        data.events.family.forEach(e => {
                            if (e.start_date && e.end_date && e.start_date !== e.end_date) {
                                let curr = new Date(e.start_date)
                                const end = new Date(e.end_date)
                                while (curr <= end) {
                                    displayEvents.push({
                                        ...e,
                                        date: format(curr, 'yyyy-MM-dd'),
                                        // Clear start/end to prevents redundant range logic/display if any
                                        start_date: undefined,
                                        end_date: undefined
                                    })
                                    curr.setDate(curr.getDate() + 1)
                                }
                            } else {
                                displayEvents.push(e)
                            }
                        })

                        // Add other events
                        displayEvents.push(...data.events.islamic)
                        displayEvents.push(...data.events.commemorations)

                        // Filter optional
                        if (selectedDate) {
                            displayEvents = displayEvents.filter(e => e.date === selectedDate)
                        }


                        displayEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

                        if (displayEvents.length === 0) {
                            return (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-sm">Tidak ada agenda {selectedDate ? 'pada tanggal ini' : 'bulan ini'}</p>
                                </div>
                            )
                        }

                        return (
                            <div className="space-y-2">
                                {displayEvents.map((event, i) => (
                                    <div
                                        key={`${event.type}-${i}`}
                                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                                    >
                                        <div className={`w-1 h-12 rounded-full ${getEventTypeColor(event.type)}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-gray-900">{event.title || event.label}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize text-white ${getEventTypeColor(event.type)}`}>
                                                    {event.type === 'commemoration' ? 'Haul/Peringatan' : event.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {format(new Date(event.date), 'd MMMM yyyy', { locale: id })}
                                                {event.person_name && ` • ${event.person_name}`}
                                            </p>
                                            {event.hijri_date && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {event.hijri_date}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>
            )}
        </MobileLayout>
    )
}
