
import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useReactFlow, ReactFlowProvider } from '@xyflow/react'
import { useBranch, useMe, FamilyTree } from '../../features/silsilah'
import { buildTreeLayout } from '../../features/silsilah/utils/treeLayout'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { TreeControls } from '../../features/silsilah/components/TreeControls'
import { MemberSidebar } from '../../features/silsilah/components/MemberSidebar'
import { MiniMap } from '../../features/silsilah/components/MiniMap'
import type { Person } from '../../features/silsilah/types'

function BranchPageContent() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, error } = useBranch(Number(id))
    const reactFlowInstance = useReactFlow()

    // UI State
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [highlightLine, setHighlightLine] = useState(false)

    // Data Processing
    const { branch, persons, parent_child, marriages } = data || {}

    // Build tree layout - memoized
    const { nodes: rawNodes, edges: rawEdges } = useMemo(() =>
        buildTreeLayout(persons || [], parent_child || [], marriages || [], branch?.id),
        [persons, parent_child, marriages, branch?.id]
    )

    // Helper: Map of Node ID -> Is Direct Line
    // Used for coloring edges efficiently
    const directLineNodeIds = useMemo(() => {
        const ids = new Set<string>()
        if (!branch?.id) return ids

        rawNodes.forEach(node => {
            if (node.type === 'personNode') {
                const p = node.data as Person
                if (p.branch_id === branch.id) {
                    ids.add(node.id)
                }
            }
        })
        return ids
    }, [rawNodes, branch?.id])

    // Apply Highlight Logic to Nodes
    const nodes = useMemo(() => {
        if (!highlightLine || !branch?.id) return rawNodes

        return rawNodes.map(node => {
            if (node.type === 'personNode') {
                const isDirectLine = directLineNodeIds.has(node.id)

                return {
                    ...node,
                    data: {
                        ...node.data,
                        isDimmed: !isDirectLine,
                        // Add visual pop for direct line (red ring)
                        customStyle: isDirectLine ? 'ring-2 ring-[#ec1325] shadow-md shadow-[#ec1325]/20' : ''
                    }
                }
            }
            return node
        })
    }, [rawNodes, highlightLine, branch?.id, directLineNodeIds])

    // Apply Highlight Logic to Edges
    const edges = useMemo(() => {
        if (!highlightLine || !branch?.id) return rawEdges

        return rawEdges.map(edge => {
            // Logic: An edge is "Direct Line" if the Person connected to it is Direct Line.
            // Edges are usually Person -> MarriageNode OR MarriageNode -> Person.
            // So we check if EITHER source or target is a Direct Line Person Node.

            const isSourceDirect = directLineNodeIds.has(edge.source)
            const isTargetDirect = directLineNodeIds.has(edge.target)

            // Note: MarriageNodes are not in directLineNodeIds. 
            // - If Source is Person (Direct) -> MN: Highlight
            // - If MN -> Target is Person (Direct): Highlight
            const isDirectEdge = isSourceDirect || isTargetDirect

            if (isDirectEdge) {
                return {
                    ...edge,
                    style: { stroke: '#ec1325', strokeWidth: 3 },
                    animated: true, // Optional: make it flow to emphasize "current" path
                    zIndex: 10
                }
            } else {
                return {
                    ...edge,
                    style: { stroke: '#e6dbdc', strokeWidth: 1, opacity: 0.3 },
                }
            }
        })
    }, [rawEdges, highlightLine, branch?.id, directLineNodeIds])

    // Auth User
    const { data: me } = useMe()

    const [searchParams] = useSearchParams()
    const focusId = searchParams.get('focus')

    // Auto-focus Logic
    useEffect(() => {
        if (nodes.length > 0) {
            let targetNode = null
            let zoomLevel = 1.2

            // Priority 0: URL Search Param (?focus=ID)
            if (focusId) {
                targetNode = nodes.find(n => n.id === `person-${focusId}`)
                if (targetNode) zoomLevel = 1.5
            }

            // Priority 1: Logged-in User
            if (!targetNode && me?.person) {
                targetNode = nodes.find(n => n.id === `person-${me.person.id}`)
                if (targetNode) zoomLevel = 1.5
            }

            // Priority 2: Root (Gen 1)
            if (!targetNode) {
                targetNode = nodes.find(n => n.type === 'personNode' && (n.data as any)?.generation === 1)
            }

            if (targetNode) {
                const x = targetNode.position.x + 90
                const y = targetNode.position.y + 45
                setTimeout(() => {
                    reactFlowInstance.setCenter(x, y, { zoom: zoomLevel, duration: 1200 })
                }, 100)
            } else {
                // Priority 3: Fit View
                setTimeout(() => {
                    reactFlowInstance.fitView({ padding: 0.2, duration: 800 })
                }, 100)
            }
        }
    }, [nodes, reactFlowInstance, me, focusId])

    // Handlers
    const handleNodeClick = (personId: number) => {
        const person = persons?.find(p => p.id === personId)
        if (person) {
            setSelectedPerson(person)
            setIsSidebarOpen(true)
        }
    }

    const handleZoomIn = () => reactFlowInstance.zoomIn()
    const handleZoomOut = () => reactFlowInstance.zoomOut()
    const handleFitView = () => reactFlowInstance.fitView({ padding: 0.2 })

    // Conditional Rendering
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#f8f6f6]">
                <span className="material-symbols-outlined animate-spin text-[#ec1325] text-4xl">
                    progress_activity
                </span>
            </div>
        )
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {(error as Error).message}</div>
    }

    // Main Render
    return (
        <div className="h-screen w-full bg-[#f8f6f6] flex flex-col overflow-hidden">
            <PortalHeader />

            <div className="flex-1 relative">
                {/* Top Controls Overlay */}
                <div className="absolute top-4 left-4 md:left-4 z-10 flex flex-col md:flex-row gap-3 items-start md:items-center">
                    {/* Branch Info */}
                    <div className="bg-white/90 backdrop-blur px-4 py-2.5 rounded-xl shadow-sm border border-[#e6dbdc]">
                        <h1 className="text-lg font-bold text-[#ec1325]">
                            {branch?.name || 'Silsilah Keluarga'}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-[#896165]">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">group</span>
                                {persons?.length || 0} Members
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">hub</span>
                                Branch {branch?.order}
                            </span>
                        </div>
                    </div>

                    {/* Highlight Toggle Node */}
                    <button
                        onClick={() => setHighlightLine(!highlightLine)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm border text-xs font-medium transition-all backdrop-blur ${highlightLine
                            ? 'bg-[#ec1325] border-[#ec1325] text-white shadow-[#ec1325]/20'
                            : 'bg-white/90 border-[#e6dbdc] text-[#181112] hover:border-[#ec1325] hover:text-[#ec1325]'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {highlightLine ? 'hub' : 'hub'}
                        </span>
                        {highlightLine ? 'Line Active' : 'Highlight Direct Line'}
                    </button>

                    {/* Legend (Only when highlighting) */}
                    {highlightLine && (
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2.5 rounded-xl border border-[#e6dbdc] text-[10px] text-[#896165]">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#ec1325]"></span> Direct
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span> Spouse
                            </span>
                        </div>
                    )}
                </div>

                <FamilyTree
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={handleNodeClick}
                />

                <MiniMap />

                <TreeControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitView={handleFitView}
                    isSidebarOpen={isSidebarOpen}
                />

                <MemberSidebar
                    person={selectedPerson}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>
        </div>
    )
}

export function BranchPage() {
    return (
        <ReactFlowProvider>
            <BranchPageContent />
        </ReactFlowProvider>
    )
}
