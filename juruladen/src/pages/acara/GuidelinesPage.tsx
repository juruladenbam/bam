import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEvents } from '../../features/events/hooks/useEvent'
import { EventSelector } from '../../features/events/components/EventSelector'
import { useGuidelines, useUpdateGuideline } from '../../features/acara/hooks/useAcara'
import { LoadingSkeleton, EmptyState } from '../../components/ui'
import { FileText, Save } from 'lucide-react'

type GuideType = 'juknis' | 'juklak'

export default function GuidelinesPage() {
  const { eventSlug } = useParams()
  const { data: events } = useEvents()
  const currentEvent = events?.find(e => e.slug === eventSlug) || events?.[0]
  const eventId = currentEvent?.id ?? null

  const { data: guidelines, isLoading } = useGuidelines(eventId)
  const updateGuideline = useUpdateGuideline(eventId!)

  const [activeTab, setActiveTab] = useState<GuideType>('juknis')
  const [content, setContent] = useState('')
  const [, setLoaded] = useState(false)

  // Load content when guidelines change
  const guideline = guidelines?.find(g => g.type === activeTab)

  // Update textarea when switching tabs
  const handleTabChange = (tab: GuideType) => {
    setActiveTab(tab)
    const g = guidelines?.find(g => g.type === tab)
    setContent(g?.content || '')
    setLoaded(true)
  }

  // Initialize content on first load
  if (guideline && !content && !guidelines?.find(g => g.type === activeTab)?.content) {
    // Wait for guidelines to load
  }

  const currentContent = guidelines?.find(g => g.type === activeTab)?.content || ''

  const handleSave = () => {
    updateGuideline.mutate({ type: activeTab, data: { content } })
  }

  if (isLoading) return <LoadingSkeleton lines={8} />
  if (!currentEvent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Juknis & Juklak</h1>
          <EventSelector />
        </div>
        <EmptyState title="Belum ada acara" description="Pilih atau buat acara terlebih dahulu." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Juknis & Juklak</h1>
        <EventSelector />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['juknis', 'juklak'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'juknis' ? 'Juknis' : 'Juklak'}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">
            {activeTab === 'juknis' ? 'Petunjuk Teknis' : 'Petunjuk Pelaksanaan'}
          </h2>
        </div>

        <textarea
          key={activeTab}
          value={currentContent || content}
          onChange={e => setContent(e.target.value)}
          rows={16}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          placeholder={`Tulis ${activeTab === 'juknis' ? 'Juknis' : 'Juklak'} di sini...`}
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateGuideline.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {updateGuideline.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
