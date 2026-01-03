
import { memo, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { Person } from '../types'
import { GhostNodeBadge } from './GhostNodeBadge'

interface PersonNodeData extends Person {
    isGhost?: boolean
    originalPersonId?: number
    originalBranchId?: number
    originalBranchName?: string
    isDimmed?: boolean
    customStyle?: string
}

interface PersonNodeProps {
    data: PersonNodeData
}

function PersonNodeComponent({ data }: PersonNodeProps) {
    const isMale = data.gender === 'male'
    const isDeceased = !data.is_alive


    // Handle navigation to original person node
    const handleGhostNavigate = useCallback((personId: number, branchId: number) => {
        // Find the original node and center on it
        const originalNodeId = `person-${personId}`

        // Emit custom event for parent to handle branch switching if needed
        window.dispatchEvent(new CustomEvent('ghost-navigate', {
            detail: { personId, branchId, nodeId: originalNodeId }
        }))
    }, [])

    return (
        <div
            className={`
        relative px-4 py-3 rounded-xl shadow-sm border w-[180px] min-h-[90px] flex flex-col justify-center z-10 transition-all duration-200 group
        bg-white border-[#e6dbdc]
        ${isDeceased ? 'opacity-75 grayscale' : ''}
        ${data.isGhost ? 'border-dashed opacity-60' : ''}
        ${data.isDimmed
                    ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                    : 'hover:shadow-md hover:border-[#ec1325] hover:scale-105'
                }
        ${data.customStyle || ''}
      `}
        >
            {/* Top handle for parent connection */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                className="!bg-gray-400 !w-3 !h-3"
            />

            {/* Side handles for marriage */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!bg-transparent !border-none !w-1 !h-1"
                style={{ right: 0, top: '50%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="!bg-transparent !border-none !w-1 !h-1"
                style={{ left: 0, top: '50%' }}
            />

            {/* Ghost badge with navigation */}
            {data.isGhost && data.originalPersonId && (
                <GhostNodeBadge
                    originalPersonId={data.originalPersonId}
                    personName={data.full_name}
                    originalBranchId={data.originalBranchId || data.branch_id}
                    originalBranchName={data.originalBranchName}
                    onNavigate={handleGhostNavigate}
                />
            )}

            {/* Photo or Avatar */}
            <div className="flex items-center gap-3">
                <div
                    className={`
            w-10 h-10 rounded-full flex items-center justify-center text-lg
            ${isMale ? 'bg-blue-200 text-blue-700' : 'bg-pink-200 text-pink-700'}
          `}
                >
                    {data.photo_url ? (
                        <img
                            src={data.photo_url}
                            alt={data.full_name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="material-symbols-outlined">
                            {isMale ? 'man' : 'woman'}
                        </span>
                    )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate" title={data.full_name}>
                        {data.full_name}
                    </p>
                    {data.nickname && (
                        <p className="text-xs text-gray-500 truncate">{data.nickname}</p>
                    )}
                </div>
            </div>

            {/* Generation badge - hide for Gen 0 (outside spouses) */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                {data.generation > 0 && <span>Gen {data.generation}</span>}
                {isDeceased && (
                    <span className="flex items-center gap-1 text-gray-400">
                        <span className="material-symbols-outlined text-sm">deceased</span>
                    </span>
                )}
            </div>

            {/* Bottom handle for children connection */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="!bg-gray-400 !w-3 !h-3"
            />
        </div>
    )
}

export const PersonNode = memo(PersonNodeComponent)
