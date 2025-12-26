
interface TreeControlsProps {
    onZoomIn: () => void
    onZoomOut: () => void
    onFitView: () => void
    isSidebarOpen: boolean
}

export function TreeControls({
    onZoomIn,
    onZoomOut,
    onFitView,
    isSidebarOpen
}: TreeControlsProps) {
    return (
        <div
            className={`
                absolute bottom-6 flex flex-col gap-4 z-20 transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'right-6 md:right-[410px]' : 'right-6'}
            `}
        >
            {/* Zoom Controls */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-col rounded-lg bg-white shadow-lg overflow-hidden border border-[#e6dbdc]">
                    <button
                        onClick={onZoomIn}
                        className="flex size-10 items-center justify-center text-[#181112] hover:bg-[#f8f6f6] active:bg-gray-100 transition-colors border-b border-[#e6dbdc]"
                        title="Zoom In"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <button
                        onClick={onZoomOut}
                        className="flex size-10 items-center justify-center text-[#181112] hover:bg-[#f8f6f6] active:bg-gray-100 transition-colors"
                        title="Zoom Out"
                    >
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                </div>
                <button
                    onClick={onFitView}
                    className="flex size-10 items-center justify-center rounded-lg bg-white text-[#181112] hover:bg-[#f8f6f6] shadow-lg border border-[#e6dbdc]"
                    title="Fit to Screen"
                >
                    <span className="material-symbols-outlined">center_focus_strong</span>
                </button>
            </div>
        </div>
    )
}
