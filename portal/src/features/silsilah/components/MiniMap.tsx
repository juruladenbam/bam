
import { MiniMap as ReactFlowMiniMap } from '@xyflow/react'

export function MiniMap() {
    return (
        <div className="absolute top-4 left-4 z-10 hidden lg:block overflow-hidden rounded-lg shadow-lg border border-[#e6dbdc]">
            <ReactFlowMiniMap
                nodeStrokeColor="#e6dbdc"
                nodeColor={(node) => {
                    return node.type === 'marriageNode' ? '#ffccd5' : '#fff'
                }}
                maskColor="rgb(248, 246, 246, 0.7)"
                style={{
                    backgroundColor: '#fff',
                    height: 120,
                    width: 180,
                }}
            />
        </div>
    )
}
