import type { EventSchedule } from '../api/eventApi'

interface EventScheduleListProps {
    schedules: EventSchedule[]
}

export function EventScheduleList({ schedules }: EventScheduleListProps) {
    // Group schedules by day
    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const day = schedule.day_sequence
        if (!acc[day]) acc[day] = []
        acc[day].push(schedule)
        return acc
    }, {} as Record<number, EventSchedule[]>)

    const dayLabels = ['', 'Hari Pertama', 'Hari Kedua', 'Hari Ketiga', 'Hari Keempat', 'Hari Kelima']

    return (
        <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([day, items]) => (
                <div key={day} className="bg-white rounded-xl border border-[#e6dbdc] overflow-hidden">
                    <div className="bg-[#f8f6f6] px-5 py-3 border-b border-[#e6dbdc]">
                        <h3 className="font-semibold text-[#181112]">
                            {dayLabels[Number(day)] || `Hari ke-${day}`}
                        </h3>
                    </div>
                    <div className="divide-y divide-[#e6dbdc]">
                        {items
                            .sort((a, b) => a.time_start.localeCompare(b.time_start))
                            .map((schedule) => (
                                <div key={schedule.id} className="px-5 py-4 flex gap-4">
                                    <div className="flex-shrink-0 w-20 text-sm">
                                        <span className="font-medium text-[#ec1325]">{schedule.time_start}</span>
                                        {schedule.time_end && (
                                            <span className="text-[#896165]"> - {schedule.time_end}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-[#181112]">{schedule.title}</h4>
                                        {schedule.description && (
                                            <p className="text-sm text-[#896165] mt-1">{schedule.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default EventScheduleList
