import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

function MarriageNodeComponent() {
    return (
        <div className="relative w-2 h-2 bg-[#ec1325] rounded-full z-20">
            {/* Handles for spouses */}
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="!bg-transparent !border-none !w-1 !h-1"
                style={{ left: 0 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!bg-transparent !border-none !w-1 !h-1"
                style={{ right: 0 }}
            />

            {/* Handle for children */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="!bg-transparent !border-none !w-1 !h-1"
                style={{ bottom: 0 }}
            />
        </div>
    )
}

export const MarriageNode = memo(MarriageNodeComponent)
