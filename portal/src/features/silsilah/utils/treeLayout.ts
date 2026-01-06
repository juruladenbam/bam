import type { Person } from '../types'

interface ParentChildLink {
    child_id: number
    marriage_id: number
    father_id: number | null
    mother_id: number | null
    birth_order?: number
}

interface Marriage {
    id: number
    husband_id: number
    wife_id: number
    is_active?: boolean // Added optional is_active
}

interface TreeNode {
    id: string
    type: 'personNode' | 'marriageNode'
    position: { x: number; y: number }
    data: Person | { id: string }
}

interface TreeEdge {
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
    type?: string
    style?: Record<string, unknown>
}

// Global config
const NODE_WIDTH = 170
const NODE_HEIGHT = 85
const VERTICAL_GAP = 150
const HORIZONTAL_GAP = 40

/**
 * Build a pyramid tree layout - root at top center, expanding downward
 */
export function buildTreeLayout(
    persons: Person[],
    parentChildLinks: ParentChildLink[],
    marriages: Marriage[] = [],
    mainBranchId?: number
): { nodes: TreeNode[]; edges: TreeEdge[] } {
    if (persons.length === 0) {
        return { nodes: [], edges: [] }
    }

    const personById = new Map<number, Person>()
    persons.forEach((p) => personById.set(p.id, p))

    // Build birth_order lookup from parentChildLinks (this is the source of truth)
    const birthOrderByChild = new Map<number, number>()
    parentChildLinks.forEach((link) => {
        if (link.birth_order !== undefined && link.birth_order !== null) {
            birthOrderByChild.set(link.child_id, link.birth_order)
        }
    })

    // Build parent -> children map
    const childrenByParent = new Map<number, number[]>()
    parentChildLinks.forEach((link) => {
        [link.father_id, link.mother_id].forEach((parentId) => {
            if (parentId && personById.has(parentId) && personById.has(link.child_id)) {
                if (!childrenByParent.has(parentId)) {
                    childrenByParent.set(parentId, [])
                }
                const list = childrenByParent.get(parentId)!
                if (!list.includes(link.child_id)) {
                    list.push(link.child_id)
                }
            }
        })
    })

    // Build spouse map (Map<number, number[]>)
    const spouseMap = new Map<number, number[]>()
    marriages.forEach((m) => {
        // Check visibility: Hide only if divorced (both alive and inactive)
        if (m.is_active === false) {
            const h = personById.get(m.husband_id)
            const w = personById.get(m.wife_id)
            if (h && w && h.is_alive && w.is_alive) {
                return
            }
        }

        if (personById.has(m.husband_id) && personById.has(m.wife_id)) {
            // Add wife to husband
            if (!spouseMap.has(m.husband_id)) spouseMap.set(m.husband_id, [])
            const husSpouses = spouseMap.get(m.husband_id)!
            if (!husSpouses.includes(m.wife_id)) husSpouses.push(m.wife_id)

            // Add husband to wife
            if (!spouseMap.has(m.wife_id)) spouseMap.set(m.wife_id, [])
            const wifeSpouses = spouseMap.get(m.wife_id)!
            if (!wifeSpouses.includes(m.husband_id)) wifeSpouses.push(m.husband_id)
        }
    })

    // Find min generation among MAIN branch members only
    const mainBranchPersons = mainBranchId
        ? persons.filter(p => p.branch_id === mainBranchId)
        : persons

    const minGeneration = Math.min(...mainBranchPersons.map((p) => p.generation))

    // Get roots from main branch members at min generation
    const roots = mainBranchPersons
        .filter((p) => p.generation === minGeneration)
        .sort((a, b) => (a.birth_order ?? 999) - (b.birth_order ?? 999))

    // Track which nodes are placed
    const placed = new Set<number>()

    // Get sorted children of a person
    function getSortedChildren(personId: number): Person[] {
        const childIds = new Set<number>()

        // Add own children
        childrenByParent.get(personId)?.forEach((id) => childIds.add(id))

        // Add spouse's children (all spouses)
        const spouseIds = spouseMap.get(personId) || []
        spouseIds.forEach(spouseId => {
            childrenByParent.get(spouseId)?.forEach((id) => childIds.add(id))
        })

        return Array.from(childIds)
            .filter((id) => personById.has(id) && !placed.has(id))
            .map((id) => personById.get(id)!)
            .sort((a, b) => {
                // Use birth_order from parentChildLinks (source of truth), fallback to person.birth_order
                const aOrder = birthOrderByChild.get(a.id) ?? a.birth_order ?? 999
                const bOrder = birthOrderByChild.get(b.id) ?? b.birth_order ?? 999
                if (aOrder !== bOrder) return aOrder - bOrder
                return a.full_name.localeCompare(b.full_name)
            })
    }

    // Calculate subtree width (memoized)
    const widthCache = new Map<number, number>()

    function getSubtreeWidth(personId: number, visited: Set<number>): number {
        if (visited.has(personId)) return 0

        const cacheKey = personId
        if (widthCache.has(cacheKey)) return widthCache.get(cacheKey)!

        const newVisited = new Set(visited)
        newVisited.add(personId)

        const spouseIds = spouseMap.get(personId) || []
        // Only count unvisited spouses
        const activeSpouses = spouseIds.filter(sid => !visited.has(sid) && personById.has(sid))
        activeSpouses.forEach(sid => newVisited.add(sid))

        // Get children (not yet visited)
        const childIds = new Set<number>()
        childrenByParent.get(personId)?.forEach((id) => childIds.add(id))
        spouseIds.forEach(spouseId => {
            childrenByParent.get(spouseId)?.forEach((id) => childIds.add(id))
        })

        const children = Array.from(childIds).filter(
            (id) => personById.has(id) && !newVisited.has(id)
        )

        let childrenWidth = 0
        if (children.length > 0) {
            childrenWidth = children.reduce((sum, childId, idx) => {
                const w = getSubtreeWidth(childId, newVisited)

                // Calculate gap to next sibling
                // Gap needs to account for:
                // 1. If THIS child has RIGHT spouse(s) → extra space needed
                // 2. If NEXT child has LEFT spouse(s) → extra space needed
                // 3. Base gap for readability

                if (idx < children.length - 1) {
                    const nextChildId = children[idx + 1]
                    const nextW = getSubtreeWidth(nextChildId, newVisited)

                    // Dynamic gap based on subtree widths to prevent overlap
                    // Each child's subtree extends w/2 to each side from center
                    // Gap = half of this child's width + half of next child's width + buffer
                    const minBuffer = 20 // Minimum visual separation
                    const gap = Math.max(minBuffer, (w / 2) + (nextW / 2) - (170 * 0.8))
                    return sum + w + gap
                }
                return sum + w
            }, 0)
        }

        const NODE_WIDTH = 170
        const MIN_GAP = 40 // Minimum gap per side

        // Calculate actual gap needed based on children width under each spouse
        // This matches the dynamic gap logic in layoutSubtree
        let totalFamilyWidth = NODE_WIDTH // Start with pivot width

        if (activeSpouses.length > 0) {
            // For each spouse, calculate actual gap needed (same logic as spouseGaps in layoutSubtree)
            activeSpouses.forEach(sid => {
                // Get children of this spouse pair
                const spouseChildren: number[] = []
                childrenByParent.get(personId)?.forEach(cid => {
                    const link = parentChildLinks.find(l => l.child_id === cid)
                    if (link && (link.father_id === sid || link.mother_id === sid)) {
                        spouseChildren.push(cid)
                    }
                })

                // Calculate cluster width for this spouse's children
                let clusterWidth = 0
                spouseChildren.forEach((cid, idx) => {
                    if (!newVisited.has(cid)) {
                        clusterWidth += getSubtreeWidth(cid, newVisited)
                        if (idx < spouseChildren.length - 1) {
                            const hasSpouse = (spouseMap.get(cid)?.length ?? 0) > 0
                            clusterWidth += hasSpouse ? 50 : 30
                        }
                    }
                })

                // Dynamic gap: base 40 + overflow if children are wide
                const neededGap = Math.max(MIN_GAP, (clusterWidth / 2) + 20)
                const coupleGap = neededGap * 2

                totalFamilyWidth += NODE_WIDTH + coupleGap
            })
        }

        const totalWidth = Math.max(totalFamilyWidth, childrenWidth)
        widthCache.set(cacheKey, totalWidth)
        return totalWidth
    }

    // Build node positions
    const positions = new Map<number, { x: number; y: number }>()
    const marriageNodes = new Map<string, { id: string; x: number; y: number }>() // Keyed by "minId-maxId" of couple

    // Build child -> parents map for easier lookup
    const parentsByChild = new Map<number, { father: number | null, mother: number | null }>()
    parentChildLinks.forEach(l => {
        parentsByChild.set(l.child_id, { father: l.father_id, mother: l.mother_id })
    })

    function layoutSubtree(personId: number, centerX: number, y: number): void {
        if (placed.has(personId)) return
        placed.add(personId)

        const allSpouses = spouseMap.get(personId) || []
        const activeSpouses = allSpouses.filter(sid => personById.has(sid) && !placed.has(sid))
        activeSpouses.forEach(s => placed.add(s))

        const person = personById.get(personId)!

        // Group children by spouse
        const children = getSortedChildren(personId)
        const childrenBySpouse = new Map<number, Person[]>()
        const pivotChildren: Person[] = [] // Children without known spouse here

        children.forEach(child => {
            const parents = parentsByChild.get(child.id)
            let matchedSpouseId: number | undefined

            if (parents) {
                // Find which spouse is the other parent
                const otherParentId = parents.father === personId ? parents.mother : parents.father
                if (otherParentId && activeSpouses.includes(otherParentId)) {
                    matchedSpouseId = otherParentId
                }
            }

            if (matchedSpouseId) {
                if (!childrenBySpouse.has(matchedSpouseId)) childrenBySpouse.set(matchedSpouseId, [])
                childrenBySpouse.get(matchedSpouseId)!.push(child)
            } else {
                pivotChildren.push(child)
            }
        })

        // Helper to get cluster width
        const getClusterWidth = (clusterWaitList: Person[]) => {
            if (clusterWaitList.length === 0) return 0
            // Use empty set for geometry calculation to ensure full subtree size is measured
            let totalWidth = 0
            clusterWaitList.forEach((c, idx) => {
                totalWidth += getSubtreeWidth(c.id, new Set())
                // Gap to next sibling - based on subtree widths
                if (idx < clusterWaitList.length - 1) {
                    const thisW = getSubtreeWidth(c.id, new Set())
                    const nextChild = clusterWaitList[idx + 1]
                    const nextW = getSubtreeWidth(nextChild.id, new Set())

                    // Dynamic gap: prevent subtree overlap
                    const minBuffer = 20
                    const gap = Math.max(minBuffer, (thisW / 2) + (nextW / 2) - (NODE_WIDTH * 0.8))
                    totalWidth += gap
                }
            })
            return totalWidth
        }

        const pivotClusterWidth = getClusterWidth(pivotChildren)
        // If pivot children width > node width, they spill over side by (Width - Node)/2
        const pivotSpill = Math.max(0, pivotClusterWidth - NODE_WIDTH) / 2

        const spouseGaps = new Map<number, number>()
        const isPolygamy = activeSpouses.length > 1
        const hasPivotChildren = pivotChildren.length > 0

        activeSpouses.forEach(sid => {
            const cluster = childrenBySpouse.get(sid) || []
            const w = getClusterWidth(cluster)
            const minGap = 40 // Compact gap for standard couples

            if (!isPolygamy && !hasPivotChildren) {
                // Standard Monogamy: Keep couple close, let children flare out.
                // Sibling spacing (subtreeWidth) handles non-overlap with Uncles.
                spouseGaps.set(sid, minGap)
            } else {
                // Polygamy or Mixed: Must ensure internal non-overlap.
                // 1. Must fit Spouse's Children Half Width (w/2).
                // 2. Must fit Pivot's Children Spill (pivotSpill).
                // 3. Must fit minimum buffer (20px).

                const neededGap = (w / 2) + pivotSpill + 20
                spouseGaps.set(sid, Math.max(minGap, neededGap))
            }
        })

        // ... (Placement Logic same as before but use spouseGaps)

        // Need to reconstruct leftSpouses / rightSpouses arrays
        let leftSpouses: number[] = []
        let rightSpouses: number[] = []

        if (activeSpouses.length === 0) {
            positions.set(personId, { x: centerX - NODE_WIDTH / 2, y })
        } else {
            if (activeSpouses.length === 1) {
                const spouseId = activeSpouses[0]
                if (person.gender === 'male') rightSpouses.push(spouseId)
                else leftSpouses.push(spouseId)
            } else {
                activeSpouses.forEach((sid, idx) => {
                    if (idx % 2 === 0) leftSpouses.push(sid)
                    else rightSpouses.push(sid)
                })
            }

            // Place Pivot
            positions.set(personId, { x: centerX - NODE_WIDTH / 2, y })

            // Place Right Spouses
            let baseX = centerX + NODE_WIDTH / 2
            rightSpouses.forEach(sid => {
                const gap = spouseGaps.get(sid)!
                const pairKey = `${Math.min(personId, sid)}-${Math.max(personId, sid)}`
                const marriageY = y + NODE_HEIGHT / 2
                const COUPLE_GAP = gap * 2

                // Spouse position (left edge)
                const spouseX = baseX + COUPLE_GAP
                positions.set(sid, { x: spouseX, y })

                // MN at exact midpoint between handle positions
                // Pivot right handle = baseX (node right edge, handle is at edge)
                // Spouse left handle = spouseX (node left edge, handle is at edge)
                // Note: Handles are positioned at edges with CSS offset, but for connection purposes
                // the midpoint should be between the visible gap between nodes
                const pivotHandleX = baseX  // Right edge of pivot node
                const spouseHandleX = spouseX  // Left edge of spouse node
                const mnX = (pivotHandleX + spouseHandleX) / 2 - 4 // -4 to center 8px MN

                marriageNodes.set(pairKey, {
                    id: `marriage-${pairKey}`,
                    x: mnX,
                    y: marriageY
                })

                baseX = spouseX + NODE_WIDTH
            })

            // Place Left Spouses
            baseX = centerX - NODE_WIDTH / 2
            leftSpouses.forEach(sid => {
                const gap = spouseGaps.get(sid)!
                const pairKey = `${Math.min(personId, sid)}-${Math.max(personId, sid)}`
                const marriageY = y + NODE_HEIGHT / 2
                const COUPLE_GAP = gap * 2

                // Spouse position (right edge of spouse = baseX - COUPLE_GAP, so left edge = that - NODE_WIDTH)
                const spouseX = baseX - COUPLE_GAP - NODE_WIDTH
                positions.set(sid, { x: spouseX, y })

                // MN at exact midpoint between Spouse right edge and Pivot left edge
                // Pivot left edge = baseX
                // Spouse right edge = spouseX + NODE_WIDTH
                const spouseRightEdge = spouseX + NODE_WIDTH
                const mnX = (spouseRightEdge + baseX) / 2 - 4 // -4 to center the 8px MN node
                marriageNodes.set(pairKey, {
                    id: `marriage-${pairKey}`,
                    x: mnX,
                    y: marriageY
                })

                baseX = spouseX
            })
        }

        // Layout Children - Cluster by Cluster
        // Helper to layout a list centered at X
        const layoutList = (list: Person[], centerX: number) => {
            if (list.length === 0) return
            const totalW = getClusterWidth(list)
            let currentChildX = centerX - totalW / 2

            list.forEach((child, idx) => {
                const w = getSubtreeWidth(child.id, new Set())

                // Center child at currentX + w/2
                layoutSubtree(child.id, currentChildX + w / 2, y + NODE_HEIGHT + VERTICAL_GAP)

                // Gap to next sibling - based on subtree widths
                if (idx < list.length - 1) {
                    const nextChild = list[idx + 1]
                    const nextW = getSubtreeWidth(nextChild.id, new Set())

                    // Dynamic gap: prevent subtree overlap
                    const minBuffer = 20
                    const gap = Math.max(minBuffer, (w / 2) + (nextW / 2) - (NODE_WIDTH * 0.8))
                    currentChildX += w + gap
                } else {
                    currentChildX += w
                }
            })
        }

        // 1. Pivot Children (Unknown mother/adoption) -> Under Person
        if (pivotChildren.length > 0) {
            layoutList(pivotChildren, centerX)
        }

        // 2. Spouse Children -> Under Marriage Node
        activeSpouses.forEach(sid => {
            const list = childrenBySpouse.get(sid)
            if (list && list.length > 0) {
                const pairKey = `${Math.min(personId, sid)}-${Math.max(personId, sid)}`
                const mn = marriageNodes.get(pairKey)
                if (mn) {
                    // Center under MN (+4 to center of 8px)
                    layoutList(list, mn.x + 4)
                }
            }
        })

        // Since we manually called layoutSubtree for children, we are done with recursion.
        // BUT original code had `getSortedChildren` and recursive call at end.
        // We must REMOVE the original recursive loop to avoid double placement.
    }

    // Layout all root trees
    const rootWidths = roots.map((r) => getSubtreeWidth(r.id, new Set()))
    const totalWidth = rootWidths.reduce((sum, w) => sum + w + HORIZONTAL_GAP * 2, -HORIZONTAL_GAP * 2)

    let currentX = -totalWidth / 2
    roots.forEach((root, idx) => {
        if (!placed.has(root.id)) {
            const width = rootWidths[idx]
            layoutSubtree(root.id, currentX + width / 2, 0)
            currentX += width + HORIZONTAL_GAP * 2
        }
    })

    // Handle orphans
    let orphanX = currentX + 300
    persons.forEach((p) => {
        if (!positions.has(p.id)) {
            positions.set(p.id, { x: orphanX, y: p.generation * (NODE_HEIGHT + VERTICAL_GAP) })
            orphanX += NODE_WIDTH + HORIZONTAL_GAP
        }
    })

    // Build nodes
    const nodes: TreeNode[] = []

    // Add Person Nodes
    positions.forEach((pos, personId) => {
        const person = personById.get(personId)
        if (person) {
            nodes.push({
                id: `person-${personId}`,
                type: 'personNode',
                position: pos,
                data: person,
            })
        }
    })

    // Add Marriage Nodes
    marriageNodes.forEach((mn) => {
        nodes.push({
            id: mn.id,
            type: 'marriageNode',
            position: { x: mn.x, y: mn.y },
            data: { id: mn.id },
        })
    })

    // Build edges
    const edges: TreeEdge[] = []
    const addedEdges = new Set<string>()

    // Marriage edges (Connect Spouses to Marriage Node)
    marriages.forEach((m) => {
        // Find the marriage node key
        const pairKey = `${Math.min(m.husband_id, m.wife_id)}-${Math.max(m.husband_id, m.wife_id)}`
        const mn = marriageNodes.get(pairKey)

        if (mn && positions.has(m.husband_id) && positions.has(m.wife_id)) {
            // Determine Left/Right based on positions x
            const husbandX = positions.get(m.husband_id)!.x
            const wifeX = positions.get(m.wife_id)!.x

            const leftPersonId = husbandX < wifeX ? m.husband_id : m.wife_id
            const rightPersonId = husbandX < wifeX ? m.wife_id : m.husband_id

            // Left Person -> MarriageNode (Left person uses Right Handle -> MN Left Handle)
            edges.push({
                id: `e-${leftPersonId}-${mn.id}`,
                source: `person-${leftPersonId}`,
                target: mn.id,
                sourceHandle: 'right',
                targetHandle: 'left',
                type: 'straight',
                style: { stroke: '#ec1325', strokeWidth: 2, strokeDasharray: '5,5' },
            })

            // MarriageNode -> Right Person (MN Right Handle -> Right person uses Left Handle)
            edges.push({
                id: `e-${mn.id}-${rightPersonId}`,
                source: mn.id,
                target: `person-${rightPersonId}`,
                sourceHandle: 'right',
                targetHandle: 'left',
                type: 'straight',
                style: { stroke: '#ec1325', strokeWidth: 2, strokeDasharray: '5,5' },
            })
        }
    })

    // Parent-child edges
    parentChildLinks.forEach((link) => {
        if (!positions.has(link.child_id)) return

        // Find source: Parent or Marriage Node?
        let sourceId = ''
        let sourceHandle = 'bottom'

        if (link.father_id && link.mother_id) {
            const pairKey = `${Math.min(link.father_id, link.mother_id)}-${Math.max(link.father_id, link.mother_id)}`
            const mn = marriageNodes.get(pairKey)

            if (mn) {
                sourceId = mn.id
                sourceHandle = 'bottom'
            }
        }

        // If no marriage node (single parent or lookup failed), fallback to parent
        if (!sourceId) {
            const parentId = positions.has(link.father_id ?? -1) ? link.father_id : link.mother_id
            if (parentId) sourceId = `person-${parentId}`
        }

        if (sourceId) {
            const edgeId = `pc-${sourceId}-${link.child_id}`
            if (!addedEdges.has(edgeId)) {
                edges.push({
                    id: edgeId,
                    source: sourceId,
                    target: `person-${link.child_id}`,
                    sourceHandle: sourceHandle,
                    targetHandle: 'top',
                    type: 'smoothstep',
                    style: { stroke: '#896165', strokeWidth: 2 },
                })
                addedEdges.add(edgeId)
            }
        }
    })

    return { nodes, edges }
}
