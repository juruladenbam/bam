import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Virtual } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { useCalendar, usePrefetchAdjacentMonths } from '../../features/calendar/useCalendar'
import type { CalendarDay, CalendarEvent } from '../../features/calendar/useCalendar'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// Import Swiper styles (v12+ bundled path)
import 'swiper/swiper-bundle.css'

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const toArabicNumerals = (num: number | string): string => {
    return String(num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}

// Helper to get adjacent month
function getAdjacentMonth(year: number, month: number, offset: number): { year: number; month: number } {
    let newMonth = month + offset
    let newYear = year
    while (newMonth > 12) {
        newMonth -= 12
        newYear++
    }
    while (newMonth < 1) {
        newMonth += 12
        newYear--
    }
    return { year: newYear, month: newMonth }
}

// Calendar Grid Component for a single month
function MonthGrid({
    year,
    month,
    selectedDate,
    onSelectDate
}: {
    year: number
    month: number
    selectedDate: string | null
    onSelectDate: (date: string | null) => void
}) {
    const { data, isLoading, isFetching } = useCalendar(year, month)

    // Get events for a specific date
    const getEventsForDate = (dateStr: string): CalendarEvent[] => {
        if (!data) return []
        const events: CalendarEvent[] = []

        data.events.family.forEach(e => {
            if (e.start_date && e.end_date) {
                if (dateStr >= e.start_date && dateStr <= e.end_date) {
                    events.push(e)
                }
            } else if (e.date === dateStr) {
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

    // Build calendar grid
    const buildCalendarGrid = (): (CalendarDay | null)[] => {
        if (!data) return []

        const firstDay = new Date(year, month - 1, 1).getDay()
        const grid: (CalendarDay | null)[] = []

        for (let i = 0; i < firstDay; i++) {
            grid.push(null)
        }

        data.days.forEach(day => {
            grid.push(day)
        })

        return grid
    }

    const getEventTypeColor = (type: string): string => {
        switch (type) {
            case 'family': return 'bg-emerald-500'
            case 'islamic': return 'bg-blue-500'
            case 'commemoration': return 'bg-purple-500'
            default: return 'bg-gray-500'
        }
    }

    const isToday = (dateStr: string): boolean => {
        return dateStr === format(new Date(), 'yyyy-MM-dd')
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec1325]" />
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Subtle loading overlay */}
            {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ec1325]" />
                </div>
            )}

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7">
                {buildCalendarGrid().map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="min-h-[80px] md:min-h-[100px] bg-gray-50 border-b border-r border-gray-100" />
                    }

                    const events = getEventsForDate(day.date)
                    const today = isToday(day.date)
                    const isSelected = selectedDate === day.date
                    const isSunday = new Date(day.date).getDay() === 0

                    return (
                        <div
                            key={day.date}
                            onClick={() => onSelectDate(isSelected ? null : day.date)}
                            className={`min-h-[80px] md:min-h-[100px] p-1.5 md:p-2 border-b border-r border-gray-100 cursor-pointer transition-colors
                                ${today ? 'bg-[#ec1325]/15' : ''}
                                ${isSelected ? 'bg-amber-50 ring-2 ring-inset ring-[#ec1325] z-10' : 'hover:bg-gray-50'}
                            `}
                        >
                            {/* Date Numbers */}
                            <div className="flex items-start justify-between mb-0.5">
                                <span className={`text-base md:text-lg font-semibold ${today ? '' : isSunday ? 'text-red-500' : 'text-gray-900'}`}>
                                    {day.day}
                                </span>
                                <span className="text-lg md:text-xl text-emerald-600 font-serif leading-none">
                                    {toArabicNumerals(day.hijri.day)}
                                </span>
                            </div>

                            {/* Pasaran */}
                            <div className="text-[9px] md:text-[10px] text-gray-400 mb-0.5">
                                {day.pasaran}
                            </div>

                            {/* Events Preview - Dots on mobile, pills on desktop */}
                            <div className="space-y-0.5">
                                {/* Mobile: dots only */}
                                <div className="flex gap-0.5 md:hidden">
                                    {events.slice(0, 3).map((event, i) => (
                                        <div
                                            key={`dot-${i}`}
                                            className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`}
                                        />
                                    ))}
                                </div>
                                {/* Desktop: text pills */}
                                <div className="hidden md:block space-y-0.5">
                                    {events.slice(0, 2).map((event, i) => (
                                        <div
                                            key={`pill-${i}`}
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
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function CalendarPage() {
    const { year: yearParam, month: monthParam } = useParams<{ year?: string; month?: string }>()
    const navigate = useNavigate()
    const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    // Parse URL params or use current date
    const now = new Date()
    const year = yearParam ? parseInt(yearParam) : now.getFullYear()
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1

    // Validate year/month
    const isValidDate = year >= 1900 && year <= 2100 && month >= 1 && month <= 12

    // Current month data for header
    const { data } = useCalendar(year, month)

    // Prefetch adjacent months
    usePrefetchAdjacentMonths(year, month)

    // Generate slides: [prev, current, next]
    const slides = [
        getAdjacentMonth(year, month, -1),
        { year, month },
        getAdjacentMonth(year, month, 1),
    ]

    // Handle slide change → update URL
    const handleSlideChange = useCallback((swiper: SwiperType) => {
        const activeIndex = swiper.activeIndex
        const targetMonth = slides[activeIndex]

        // Navigate to new URL without adding to history stack for swipe
        navigate(`/calendar/${targetMonth.year}/${targetMonth.month}`, { replace: true })
        setSelectedDate(null)
    }, [navigate, slides])

    // Navigate to adjacent month via buttons
    const handleNavigate = (direction: 'prev' | 'next') => {
        const target = direction === 'prev'
            ? getAdjacentMonth(year, month, -1)
            : getAdjacentMonth(year, month, 1)
        navigate(`/calendar/${target.year}/${target.month}`)
        setSelectedDate(null)
    }

    // Reset swiper to center slide when URL changes
    useEffect(() => {
        if (swiperRef) {
            swiperRef.slideTo(1, 0) // Go to center slide instantly
        }
    }, [year, month, swiperRef])

    if (!isValidDate) {
        return (
            <MobileLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Tanggal tidak valid</p>
                </div>
            </MobileLayout>
        )
    }

    return (
        <MobileLayout>
            {/* 2-Column Layout Container */}
            <div className="w-full md:grid md:grid-cols-[1fr_380px] md:gap-6 md:px-6 md:py-6">

                {/* Left Column: Header + Calendar */}
                <div className="md:min-w-0">
                    {/* Header (Static) */}
                    <div className="px-4 pt-6 pb-2 md:px-0 md:pt-0">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => handleNavigate('prev')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="text-center">
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
                                onClick={() => handleNavigate('next')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Legend (Static) */}
                        <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-gray-600">Acara Keluarga</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-gray-600">Hari Besar Islam</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-purple-500" />
                                <span className="text-gray-600">Peringatan Kematian</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid with Swiper */}
                    <div className="w-full mb-6 md:mb-0">
                        <div className="bg-white shadow-sm border-y md:border md:rounded-xl border-gray-200 overflow-hidden select-none">
                            {/* Day Headers (Static) */}
                            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                {DAY_NAMES_SHORT.map((day, i) => (
                                    <div key={day} className={`py-3 text-center text-sm font-semibold ${i === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                        <span className="md:hidden">{day}</span>
                                        <span className="hidden md:inline">{DAY_NAMES_FULL[i]}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Swiper Container */}
                            <Swiper
                                onSwiper={setSwiperRef}
                                modules={[Virtual]}
                                spaceBetween={0}
                                slidesPerView={1}
                                initialSlide={1}
                                onSlideChange={handleSlideChange}
                                virtual
                            >
                                {slides.map((slideMonth, index) => (
                                    <SwiperSlide key={`${slideMonth.year}-${slideMonth.month}`} virtualIndex={index}>
                                        <MonthGrid
                                            year={slideMonth.year}
                                            month={slideMonth.month}
                                            selectedDate={selectedDate}
                                            onSelectDate={setSelectedDate}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>

                {/* Right Column: Event Details */}
                {data && (
                    <div className="md:px-0 md:pb-0 md:sticky md:top-6 md:self-start">
                        <div className="bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
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
                            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto md:max-h-[calc(100vh-180px)]">
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
                                                    start_date: undefined,
                                                    end_date: undefined
                                                })
                                                curr.setDate(curr.getDate() + 1)
                                            }
                                        } else {
                                            displayEvents.push(e)
                                        }
                                    })

                                    displayEvents.push(...data.events.islamic)
                                    displayEvents.push(...data.events.commemorations)

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

                                    const getEventTypeColor = (type: string): string => {
                                        switch (type) {
                                            case 'family': return 'bg-emerald-500'
                                            case 'islamic': return 'bg-blue-500'
                                            case 'commemoration': return 'bg-purple-500'
                                            default: return 'bg-gray-500'
                                        }
                                    }

                                    return displayEvents.map((event, i) => (
                                        <div
                                            key={`${event.type}-${i}`}
                                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm md:bg-gray-50 md:shadow-none"
                                        >
                                            <div className={`w-1 h-12 rounded-full ${getEventTypeColor(event.type)}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="font-medium text-gray-900 text-sm">{event.title || event.label}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize text-white shrink-0 ${getEventTypeColor(event.type)}`}>
                                                        {event.type === 'commemoration' ? 'Haul' : event.type === 'family' ? 'Acara' : 'Islam'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {format(new Date(event.date), 'd MMM yyyy', { locale: id })}
                                                    {event.person_name && ` • ${event.person_name}`}
                                                </p>
                                                {event.hijri_date && (
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {event.hijri_date}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    )
}
