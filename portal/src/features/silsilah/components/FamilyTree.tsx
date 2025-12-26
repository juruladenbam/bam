import { useCallback, type MouseEvent } from 'react'
import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type NodeTypes,
} from '@xyflow/react'
import { PersonNode } from './PersonNode'
import { MarriageNode } from './MarriageNode'
import type { TreeNode, TreeEdge, Person } from '../types'

interface FamilyTreeProps {
    nodes: TreeNode[]
    edges: TreeEdge[]
    onNodeClick?: (personId: number) => void
}

type PersonNodeData = Person & { isGhost?: boolean; originalBranchId?: number }

const nodeTypes: NodeTypes = {
    personNode: PersonNode as unknown as NodeTypes[string],
    marriageNode: MarriageNode as unknown as NodeTypes[string],
}

export function FamilyTree({ nodes: initialNodes, edges: initialEdges, onNodeClick }: FamilyTreeProps) {
    const [nodes, , onNodesChange] = useNodesState<Node>(
        initialNodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data as unknown as Record<string, unknown>,
        }))
    )

    const [edges, , onEdgesChange] = useEdgesState<Edge>(
        initialEdges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            type: e.type,
            animated: false,
            style: e.style || { stroke: '#896165', strokeWidth: 2 },
        }))
    )

    const handleNodeClick = useCallback(
        (_: MouseEvent, node: Node) => {
            const personId = (node.data as unknown as PersonNodeData)?.id
            if (personId && onNodeClick) {
                onNodeClick(personId)
            }
        },
        [onNodeClick]
    )


    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2}
            >
                <Background color="#e6dbdc" gap={20} />
                <Background color="#e6dbdc" gap={20} />
            </ReactFlow>
        </div>
    )
}
