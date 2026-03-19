import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { useReactFlow, ReactFlowProvider } from '@xyflow/react'
import { useBranch, FamilyTree, TreeListSidebar } from '../../features/silsilah'
import { usePortalMode } from '../../hooks/usePortalMode'
import { buildHorizontalTreeLayout } from '../../features/silsilah/utils/horizontalTreeLayout'
import { PortalHeader } from '../../components/layout/PortalHeader'
import { TreeControls } from '../../features/silsilah/components/TreeControls'
import { MemberSidebar } from '../../features/silsilah/components/MemberSidebar'
import { MiniMap } from '../../features/silsilah/components/MiniMap'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { Person } from '../../features/silsilah/types'

function BranchPageContent() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data, isLoading: branchLoading, error } = useBranch(Number(id))
    const { linkedPerson, isLoading: portalLoading, loginEnabled, isAuthenticated } = usePortalMode()
    const reactFlowInstance = useReactFlow()
    const isMobile = useIsMobile()

    const isLoading = branchLoading || portalLoading

    // Blur overlay logic:
    // - Only show if login is ENABLED and user is authenticated but NOT linked
    // - If login is DISABLED (guest mode), NO blur at all - per OPTIONAL_LOGIN_MODULE.md
    const showBlurOverlay = loginEnabled && isAuthenticated && !linkedPerson

    // UI State
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isTreeListOpen, setIsTreeListOpen] = useState(true) // Default open
    const [highlightLine, setHighlightLine] = useState(false)
    const [showGhostChildren, setShowGhostChildren] = useState(true) // Show children from internal marriages


    // On mobile, default TreeList to closed
    useEffect(() => {
        setIsTreeListOpen(!isMobile)
    }, [isMobile])

    // Data Processing
    const { branch, persons: rawPersons, parent_child: rawParentChild, marriages: rawMarriages } = data || {}

    // Ghost children filtering: identify persons from other branches (via internal marriages)
    const ghostChildIds = useMemo(() => {
        if (!rawPersons || !branch?.id) return new Set<number>()
        return new Set(
            rawPersons
                .filter(p => p.branch_id !== null && p.branch_id !== branch.id)
                // Exclude spouses from outside (they have no branch_id or are external)
                // Ghost children are persons who DO have a branch_id but it's a DIFFERENT branch
                .map(p => p.id)
        )
    }, [rawPersons, branch?.id])

    // Filter data based on showGhostChildren toggle
    const persons = useMemo(() => {
        if (!rawPersons || showGhostChildren) return rawPersons
        // When hiding ghost children, keep only:
        // 1. Persons from this branch (branch_id === branch.id)
        // 2. Persons with no branch_id (external spouses)
        // Filter out ghost children AND their external spouses
        const ghostSet = ghostChildIds
        return rawPersons.filter(p => !ghostSet.has(p.id))
    }, [rawPersons, showGhostChildren, ghostChildIds])

    const parent_child = useMemo(() => {
        if (!rawParentChild || showGhostChildren) return rawParentChild
        const ghostSet = ghostChildIds
        return rawParentChild.filter(pc => !ghostSet.has(pc.child_id))
    }, [rawParentChild, showGhostChildren, ghostChildIds])

    const marriages = useMemo(() => {
        if (!rawMarriages || showGhostChildren) return rawMarriages
        // Keep marriages where at least one partner is NOT a ghost child
        const ghostSet = ghostChildIds
        return rawMarriages.filter(m => !ghostSet.has(m.husband_id) || !ghostSet.has(m.wife_id))
    }, [rawMarriages, showGhostChildren, ghostChildIds])

    // Count ghost children for display
    const ghostChildCount = ghostChildIds.size

    // Statistics Calculation
    const stats = useMemo(() => {
        if (!persons) return { living: 0, kkUtuh: 0 }

        const personMap = new Map(persons.map(p => [p.id, p]))
        const living = persons.filter(p => p.is_alive).length
        const male = persons.filter(p => p.gender === 'male').length
        const female = persons.filter(p => p.gender === 'female').length

        // KK Utuh: Both husband and wife alive & active marriage
        const livingHeadIds = new Set<number>()
        marriages?.forEach(m => {
            const h = personMap.get(m.husband_id)
            const w = personMap.get(m.wife_id)
            if (m.is_active && h?.is_alive && w?.is_alive) {
                livingHeadIds.add(m.husband_id)
            }
        })

        return {
            living,
            male,
            female,
            kkUtuh: livingHeadIds.size
        }
    }, [persons, marriages])

    // Build tree layout - memoized
    const { nodes: rawNodes, edges: rawEdges } = useMemo(() => {
        return buildHorizontalTreeLayout(persons || [], parent_child || [], marriages || [], branch?.id)
    }, [persons, parent_child, marriages, branch?.id])

    // Helper: Map of Node ID -> Is Direct Line
    // Used for coloring edges efficiently
    const directLineNodeIds = useMemo(() => {
        const ids = new Set<string>()
        if (!branch?.id) return ids

        rawNodes.forEach((node: any) => {
            if (node.type === 'personNode') {
                const p = node.data as Person
                if (p.branch_id === branch.id) {
                    ids.add(node.id)
                }
            }
        })
        return ids
    }, [rawNodes, branch?.id])

    // Apply Highlight Logic + Ghost Badge to Nodes
    const nodes = useMemo(() => {
        return rawNodes.map((node: any) => {
            if (node.type === 'personNode') {
                const person = node.data as Person
                const isDirectLine = directLineNodeIds.has(node.id)
                const isGhostChild = branch?.id ? ghostChildIds.has(person.id) : false

                // Ghost badge data
                const ghostData = isGhostChild ? {
                    isGhostChild: true,
                    originalBranchName: person.branch?.name || `Qobilah #${person.branch_id}`,
                } : {}

                // Highlight logic
                const highlightData = highlightLine && branch?.id ? {
                    isDimmed: !isDirectLine,
                    customStyle: isDirectLine ? 'ring-2 ring-[#ec1325] shadow-md shadow-[#ec1325]/20' : ''
                } : {}

                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...ghostData,
                        ...highlightData,
                    }
                }
            }
            return node
        })
    }, [rawNodes, highlightLine, branch?.id, directLineNodeIds, ghostChildIds])

    // Apply Highlight Logic to Edges
    const edges = useMemo(() => {
        if (!highlightLine || !branch?.id) return rawEdges

        return rawEdges.map((edge: any) => {
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

    const [searchParams] = useSearchParams()
    const focusId = searchParams.get('focus')
    const lastFocusedId = useRef<string | null>(null)
    const hasInitialFocused = useRef(false)

    // Auto-focus Logic
    useEffect(() => {
        // Wait until nodes data is ready and not in a restricted (blur) state
        if (nodes.length === 0 || showBlurOverlay || !reactFlowInstance) return

        // 1. Focus from URL Priority
        if (focusId && focusId !== lastFocusedId.current) {
            const targetNode = nodes.find((n: any) => n.id === `person-${focusId}`)
            if (targetNode) {
                lastFocusedId.current = focusId
                hasInitialFocused.current = true // Stop initial sequence if URL focus succeeds

                const x = targetNode.position.x + 90
                const y = targetNode.position.y + 45

                setTimeout(() => {
                    reactFlowInstance.setCenter(x, y, { zoom: 1.6, duration: 1200 })
                }, 50)

                const person = persons?.find(p => p.id === Number(focusId))
                if (person) {
                    setSelectedPerson(person)
                    setIsSidebarOpen(true)
                }
                return
            }
        }

        // 2. Initial Page Load Sequence (if no URL focus was handled)
        if (!hasInitialFocused.current && !focusId) {
            let targetNode = null
            let zoomLevel = 1.2

            // Try focused linked person if applicable
            if (linkedPerson) {
                targetNode = nodes.find((n: any) => n.id === `person-${linkedPerson.id}`)
                if (targetNode) zoomLevel = 1.5
            }

            // Fallback to Root
            if (!targetNode) {
                targetNode = nodes.find((n: any) => n.type === 'personNode' && (n.data as any)?.generation === 1)
            }

            if (targetNode) {
                const x = targetNode.position.x + 90
                const y = targetNode.position.y + 45
                setTimeout(() => {
                    reactFlowInstance.setCenter(x, y, { zoom: zoomLevel, duration: 1200 })
                }, 50)
            } else {
                reactFlowInstance.fitView({ padding: 0.2, duration: 800 })
            }

            hasInitialFocused.current = true
        }
    }, [nodes, reactFlowInstance, linkedPerson, focusId, showBlurOverlay, persons])

    // Handlers
    const handleNodeClick = (personId: number) => {
        const person = persons?.find(p => p.id === personId)
        if (person) {
            setSelectedPerson(person)
            setIsSidebarOpen(true)
        }
    }

    const handlePersonClick = (personId: number) => {
        const person = persons?.find(p => p.id === personId)
        if (person) {
            // Focus on node
            handlePersonFocus(personId)
            // Open member sidebar
            setSelectedPerson(person)
            setIsSidebarOpen(true)
        }
    }

    const handlePersonFocus = (personId: number) => {
        const targetNode = nodes.find((n: any) => n.id === `person-${personId}`)
        if (targetNode) {
            const x = targetNode.position.x + 90
            const y = targetNode.position.y + 45
            reactFlowInstance.setCenter(x, y, { zoom: 1.5, duration: 800 })
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
            {/* Desktop only - hide on mobile for focused tree view */}
            {!isMobile && <PortalHeader />}

            <div className="flex-1 relative">
                {/* Overlay Blur for Unlinked Users */}
                {showBlurOverlay && (
                    <div className="absolute inset-0 z-100 backdrop-blur-md bg-white/30 flex items-center justify-center px-6">
                        <div className="bg-white rounded-2xl shadow-2xl border border-[#e6dbdc] p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
                            <div className="size-16 rounded-full bg-[#ec1325]/10 flex items-center justify-center mx-auto mb-6 text-[#ec1325]">
                                <span className="material-symbols-outlined text-4xl">link_off</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#181112] mb-3">Akses Terbatas</h2>
                            <p className="text-[#896165] text-sm mb-8 leading-relaxed">
                                Mohon maaf, fitur silsilah hanya dapat diakses oleh anggota yang sudah menautkan akun dengan data keluarga.
                            </p>
                            <Link
                                to="/claim-profile"
                                className="block w-full bg-[#ec1325] text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                            >
                                Tautkan Akun Sekarang
                            </Link>
                            <Link
                                to="/silsilah"
                                className="block w-full text-[#896165] text-sm font-medium mt-4 hover:text-[#181112] transition-colors"
                            >
                                Kembali ke Daftar Qobilah
                            </Link>
                        </div>
                    </div>
                )}

                {/* Tree List Sidebar (Left) */}
                <TreeListSidebar
                    persons={persons || []}
                    parentChildLinks={parent_child || []}
                    marriages={marriages || []}
                    branchId={branch?.id || 0}
                    isOpen={isTreeListOpen}
                    onToggle={() => setIsTreeListOpen(!isTreeListOpen)}
                    onPersonClick={handlePersonClick}
                    onPersonFocus={handlePersonFocus}
                    isMobile={isMobile}
                />

                {/* Top Controls Overlay */}
                <div className={`
                    absolute top-4 right-0 z-10 flex flex-col md:flex-row gap-3 items-center justify-center
                    transition-all duration-300 px-4
                    ${isMobile ? 'left-0' : isTreeListOpen ? 'left-[316px]' : 'left-0'}
                `}>
                    {/* Branch Info with Back Button */}
                    <div className="bg-white/90 backdrop-blur pl-2.5 pr-4 py-2 rounded-xl shadow-sm border border-[#e6dbdc] flex items-center gap-3">
                        <button
                            onClick={() => navigate('/silsilah')}
                            className="size-9 flex items-center justify-center rounded-lg text-[#896165] hover:text-[#ec1325] hover:bg-[#ec1325]/5 transition-all"
                            title="Kembali ke Daftar Qobilah"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="border-l border-[#e6dbdc] pl-3">
                            <h1 className="text-lg font-bold text-[#ec1325] leading-tight">
                                {branch?.name || 'Silsilah Keluarga'}
                            </h1>
                            <div className="flex items-center gap-3 text-xs text-[#896165]">
                                <span className="flex items-center gap-1" title="Total Anggota">
                                    <span className="material-symbols-outlined text-[14px]">group</span>
                                    {stats.living}/{persons?.length || 0}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-orange-600 font-medium" title="Keluarga Utuh (KK)">
                                    <span className="material-symbols-outlined text-[14px]">home</span>
                                    {stats.kkUtuh}
                                </span>
                                <span>•</span>
                                <div className="flex items-center gap-1 font-mono font-bold">
                                    <span className="text-blue-600">♂{stats.male}</span>
                                    <span className="text-pink-500">♀{stats.female}</span>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Action Toggles Group */}
                    <div className="flex flex-row gap-2 justify-center md:contents">
                        {/* Highlight Toggle Node */}
                        <button
                            onClick={() => setHighlightLine(!highlightLine)}
                            className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl shadow-sm border text-xs font-medium transition-all backdrop-blur ${highlightLine
                                ? 'bg-[#ec1325] border-[#ec1325] text-white shadow-[#ec1325]/20'
                                : 'bg-white/90 border-[#e6dbdc] text-[#181112] hover:border-[#ec1325] hover:text-[#ec1325]'
                                }`}
                            title={highlightLine ? 'Matikan Highlight' : 'Highlight Direct Line'}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {highlightLine ? 'hub' : 'hub'}
                            </span>
                            <span className="hidden md:inline">
                                {highlightLine ? 'Line Active' : 'Highlight Direct Line'}
                            </span>
                        </button>

                        {/* Ghost Children Toggle (Only show if there are ghost children) */}
                        {ghostChildCount > 0 && (
                            <button
                                onClick={() => setShowGhostChildren(!showGhostChildren)}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl shadow-sm border text-xs font-medium transition-all backdrop-blur ${showGhostChildren
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20'
                                    : 'bg-white/90 border-[#e6dbdc] text-[#896165] hover:border-amber-500 hover:text-amber-600'
                                    }`}
                                title={showGhostChildren ? 'Sembunyikan Sesama Cucu' : 'Tampilkan Sesama Cucu'}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {showGhostChildren ? 'family_restroom' : 'family_restroom'}
                                </span>
                                <span className="hidden md:inline">
                                    {showGhostChildren ? 'Sesama Cucu' : 'Sesama Cucu'}
                                </span>
                                <span className="font-bold">({ghostChildCount})</span>
                            </button>
                        )}
                    </div>

                    {/* Legend (Only when highlighting) */}
                    {highlightLine && (
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2.5 rounded-xl border border-[#e6dbdc] text-[10px] text-[#896165]">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#ec1325]"></span> Direct
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span> Spouse
                            </span>
                            {showGhostChildren && ghostChildCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Sesama Cucu
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <FamilyTree
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={handleNodeClick}
                    nodesDraggable={false}
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
                    isMobile={isMobile}
                    linkedPerson={linkedPerson}
                    branchId={Number(id)}
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
