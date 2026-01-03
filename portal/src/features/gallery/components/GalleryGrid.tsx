import { useState } from 'react'
import type { MediaItem } from '../api/galleryApi'

interface GalleryGridProps {
    items: MediaItem[]
    isLoading?: boolean
}

export function GalleryGrid({ items, isLoading }: GalleryGridProps) {
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-[#896165]/30">photo_library</span>
                <p className="mt-4 text-[#896165]">Belum ada media</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-all"
                    >
                        {item.type === 'image' ? (
                            <img
                                src={item.file_url}
                                alt={item.caption}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                <span className="material-symbols-outlined text-4xl text-white">play_circle</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <p className="text-sm font-medium line-clamp-2">{item.caption}</p>
                                <p className="text-xs opacity-80 mt-1">{item.year}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-[#ec1325] transition-colors"
                        onClick={() => setSelectedItem(null)}
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <div className="max-w-4xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
                        {selectedItem.type === 'image' ? (
                            <img
                                src={selectedItem.file_url}
                                alt={selectedItem.caption}
                                className="w-full h-full object-contain rounded-lg"
                            />
                        ) : (
                            <video
                                src={selectedItem.file_url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain rounded-lg"
                            />
                        )}
                        <div className="text-center mt-4 text-white">
                            <p className="text-lg font-medium">{selectedItem.caption}</p>
                            <p className="text-sm opacity-80 mt-1">
                                {selectedItem.event_name && `${selectedItem.event_name} • `}
                                {selectedItem.year}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default GalleryGrid
