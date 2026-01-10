import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const OFFSET_OPTIONS = [
    { value: -3, label: '-3 Hari' },
    { value: -2, label: '-2 Hari' },
    { value: -1, label: '-1 Hari' },
    { value: 0, label: 'Otomatis (0)' },
    { value: 1, label: '+1 Hari' },
    { value: 2, label: '+2 Hari' },
    { value: 3, label: '+3 Hari' },
]

async function getHijriOffset(): Promise<string> {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_BASE}/admin/settings/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const settings = response.data.data
    const offsetSetting = settings.find((s: { key: string }) => s.key === 'calendar.hijri_offset')
    return offsetSetting?.value || '0'
}

async function setHijriOffset(offset: number): Promise<void> {
    const token = localStorage.getItem('token')
    await axios.put(
        `${API_BASE}/admin/settings/calendar.hijri_offset`,
        { value: String(offset), type: 'text' },
        { headers: { Authorization: `Bearer ${token}` } }
    )
}

export function CalendarSettingsPage() {
    const queryClient = useQueryClient()
    const [selectedOffset, setSelectedOffset] = useState<number>(0)

    const { data: currentOffset, isLoading } = useQuery({
        queryKey: ['settings', 'hijri-offset'],
        queryFn: getHijriOffset,
    })

    useEffect(() => {
        if (currentOffset !== undefined) {
            setSelectedOffset(parseInt(currentOffset, 10))
        }
    }, [currentOffset])

    const mutation = useMutation({
        mutationFn: setHijriOffset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'hijri-offset'] })
        },
    })

    const handleSave = () => {
        mutation.mutate(selectedOffset)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Pengaturan Kalender</h2>
                <p className="text-sm text-gray-600">
                    Atur penyesuaian tanggal Hijriah berdasarkan hasil rukyat hilal.
                </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-2">Penyesuaian Tanggal Hijriah</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Default menggunakan metode hisab MABIMS. Sesuaikan jika hasil rukyat hilal PBNU berbeda.
                </p>

                {isLoading ? (
                    <div className="animate-pulse bg-gray-100 h-10 rounded-lg w-48"></div>
                ) : (
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedOffset}
                            onChange={(e) => setSelectedOffset(parseInt(e.target.value, 10))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1325] focus:border-[#ec1325] outline-none"
                        >
                            {OFFSET_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            className="px-4 py-2 bg-[#ec1325] text-white rounded-lg hover:bg-[#d1101f] disabled:opacity-50 transition"
                        >
                            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                )}

                {mutation.isSuccess && (
                    <p className="mt-3 text-sm text-emerald-600">Pengaturan berhasil disimpan!</p>
                )}

                {mutation.isError && (
                    <p className="mt-3 text-sm text-red-600">Gagal menyimpan pengaturan.</p>
                )}

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                        <strong>Catatan:</strong> Perubahan offset akan berdampak ke seluruh tanggal Hijriah di aplikasi,
                        termasuk hari besar Islam dan perhitungan haul.
                    </p>
                </div>
            </div>
        </div>
    )
}
