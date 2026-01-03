import { memo } from 'react'

interface GhostNodeBadgeProps {
    /** ID of the original person in their home branch */
    originalPersonId: number
    /** Name of the person for tooltip */
    personName: string
    /** Original branch ID where person belongs */
    originalBranchId: number
    /** Original branch name for display */
    originalBranchName?: string
    /** Callback when user wants to navigate to original */
    onNavigate: (personId: number, branchId: number) => void
    /** Size variant */
    size?: 'sm' | 'md' | 'lg'
}

/**
 * Badge component that indicates a person is displayed as a "ghost" node
 * (duplicate for visualization purposes in endogamy/internal marriages).
 * Clicking navigates to the person's original location in the tree.
 */
function GhostNodeBadgeComponent({
    originalPersonId,
    personName,
    originalBranchId,
    originalBranchName,
    onNavigate,
    size = 'md',
}: GhostNodeBadgeProps) {
    const sizeClasses = {
        sm: 'w-5 h-5 text-xs',
        md: 'w-6 h-6 text-sm',
        lg: 'w-8 h-8 text-base',
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent node selection
        onNavigate(originalPersonId, originalBranchId)
    }

    return (
        <button
            onClick={handleClick}
            className={`
                ${sizeClasses[size]}
                absolute -top-2 -right-2 
                bg-[#ec1325] hover:bg-[#c91020]
                rounded-full flex items-center justify-center 
                text-white cursor-pointer
                shadow-md hover:shadow-lg
                transition-all duration-200
                hover:scale-110
                z-20
                group
            `}
            title={`Lihat ${personName} di ${originalBranchName || 'cabang asli'}`}
        >
            <span className="material-symbols-outlined text-inherit" style={{ fontSize: 'inherit' }}>
                link
            </span>

            {/* Tooltip on hover */}
            <div className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                bg-gray-900 text-white text-xs px-2 py-1 rounded
                whitespace-nowrap opacity-0 group-hover:opacity-100
                transition-opacity pointer-events-none
                shadow-lg
            ">
                Ke cabang {originalBranchName || 'asli'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
        </button>
    )
}

export const GhostNodeBadge = memo(GhostNodeBadgeComponent)
export default GhostNodeBadge
