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
    is_active?: boolean
}

interface TreeNode {
    id: string
    type: 'personNode' | 'marriageNode'
    position: { x: number; y: number }
    data: (Person & { layoutMode?: string }) | { id: string; layoutType?: 'vertical' | 'side' }
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

// Global config for Horizontal Layout
const NODE_WIDTH = 280
const NODE_HEIGHT = 85
const HORIZONTAL_GAP = 120 // Space between generations
const VERTICAL_GAP = 50    // Space between stacked nodes (e.g. spouses)
const SPOUSE_GAP = 70      // Space between husband and wife in optimized layout

/**
 * Build a horizontal tree layout - root at left, expanding right
 * Spouses are stacked vertically.
 */
export function buildHorizontalTreeLayout(
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

    // Build birth_order lookup
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

    // Build spouse map
    const spouseMap = new Map<number, number[]>()
    marriages.forEach((m) => {
        if (m.is_active === false) {
            const h = personById.get(m.husband_id)
            const w = personById.get(m.wife_id)
            if (h && w && h.is_alive && w.is_alive) {
                return
            }
        }

        if (personById.has(m.husband_id) && personById.has(m.wife_id)) {
            if (!spouseMap.has(m.husband_id)) spouseMap.set(m.husband_id, [])
            const husSpouses = spouseMap.get(m.husband_id)!
            if (!husSpouses.includes(m.wife_id)) husSpouses.push(m.wife_id)

            if (!spouseMap.has(m.wife_id)) spouseMap.set(m.wife_id, [])
            const wifeSpouses = spouseMap.get(m.wife_id)!
            if (!wifeSpouses.includes(m.husband_id)) wifeSpouses.push(m.husband_id)
        }
    })

    // Determine Main Branch Roots
    const mainBranchPersons = mainBranchId
        ? persons.filter(p => p.branch_id === mainBranchId)
        : persons

    const minGeneration = Math.min(...mainBranchPersons.map((p) => p.generation))

    const roots = mainBranchPersons
        .filter((p) => p.generation === minGeneration)
        .sort((a, b) => (a.birth_order ?? 999) - (b.birth_order ?? 999))

    // Track placed nodes
    const placed = new Set<number>()
    const positions = new Map<number, { x: number; y: number }>()
    const marriageNodes = new Map<string, { id: string; x: number; y: number; layoutType?: 'vertical' | 'side' }>()

    // Helpers
    const getSortedChildren = (personId: number): Person[] => {
        const childIds = new Set<number>()
        childrenByParent.get(personId)?.forEach((id) => childIds.add(id))
        const spouseIds = spouseMap.get(personId) || []
        spouseIds.forEach(spouseId => {
            childrenByParent.get(spouseId)?.forEach((id) => childIds.add(id))
        })

        return Array.from(childIds)
            .filter((id) => personById.has(id) && !placed.has(id))
            .map((id) => personById.get(id)!)
            .sort((a, b) => {
                const aOrder = birthOrderByChild.get(a.id) ?? a.birth_order ?? 999
                const bOrder = birthOrderByChild.get(b.id) ?? b.birth_order ?? 999
                if (aOrder !== bOrder) return aOrder - bOrder
                return a.full_name.localeCompare(b.full_name)
            })
    }

    // Memoize subtree height
    const heightCache = new Map<number, number>()

    // Calculate vertical height needed for a subtree
    // Includes person, spouses (stacked), and all children subtrees
    function getSubtreeHeight(personId: number, visited: Set<number>): number {
        if (visited.has(personId)) return 0

        const cacheKey = personId
        if (heightCache.has(cacheKey)) return heightCache.get(cacheKey)!

        const newVisited = new Set(visited)
        newVisited.add(personId)

        const spouseIds = spouseMap.get(personId) || []
        const activeSpouses = spouseIds.filter(sid => !visited.has(sid) && personById.has(sid))
        activeSpouses.forEach(sid => newVisited.add(sid))

        // Get all children for this family unit
        const children = getSortedChildren(personId).filter(c => !newVisited.has(c.id))

        // Partition children by spouse to calculate per-spouse height
        const childrenBySpouse = new Map<number, Person[]>()
        const pivotChildren: Person[] = []

        // Need parent lookup to match child to specific spouse
        // Note: We don't have direct child->spouse link, we infer from child->parents
        children.forEach(child => {
            let matchedSpouseId: number | undefined
            // Check parents
            const parents = [
                parentChildLinks.find(l => l.child_id === child.id)?.father_id,
                parentChildLinks.find(l => l.child_id === child.id)?.mother_id
            ]

            // If one parent is personId, the other might be a spouse
            const otherParent = parents.find(p => p && p !== personId)
            if (otherParent && activeSpouses.includes(otherParent)) {
                matchedSpouseId = otherParent
            }

            if (matchedSpouseId) {
                if (!childrenBySpouse.has(matchedSpouseId)) childrenBySpouse.set(matchedSpouseId, [])
                childrenBySpouse.get(matchedSpouseId)!.push(child)
            } else {
                pivotChildren.push(child)
            }
        })

        // Calculate height for each "row" (Spouse + their children)
        // 1. Pivot (Person + Pivot Children)
        let pivotChildrenHeight = 0
        if (pivotChildren.length > 0) {
            pivotChildrenHeight = pivotChildren.reduce((sum, child) => {
                return sum + getSubtreeHeight(child.id, newVisited) + VERTICAL_GAP
            }, 0)
        }
        // Base height for person is NODE_HEIGHT. If children height is larger, use children height.
        // Actually, we stack:
        // [Person]
        // [Spouse 1]
        // [Spouse 2]
        // So total height is Sum(SpouseBlockHeight) + PersonBlockHeight

        // But we want to align spouse with their children.
        // Let's treat it as:
        // [Person] -> [Pivot Children]
        //    |
        // [Spouse 1] -> [Spouse 1 Children]

        // Height of "Person Row" = Max(NODE_HEIGHT, PivotChildrenHeight)
        const personRowHeight = Math.max(NODE_HEIGHT, pivotChildrenHeight)

        let spousesTotalHeight = 0
        activeSpouses.forEach(sid => {
            const spouseChildren = childrenBySpouse.get(sid) || []
            let childrenH = 0
            if (spouseChildren.length > 0) {
                childrenH = spouseChildren.reduce((sum, child) => {
                    return sum + getSubtreeHeight(child.id, newVisited) + VERTICAL_GAP
                }, 0)
                if (childrenH > 0) childrenH -= VERTICAL_GAP // remove last gap
            }
            const rowH = Math.max(NODE_HEIGHT, childrenH)
            spousesTotalHeight += rowH + VERTICAL_GAP
        })

        const totalHeight = personRowHeight + (activeSpouses.length > 0 ? VERTICAL_GAP : 0) + spousesTotalHeight

        // Clean up gap at end?
        // sum includes gaps between items.
        // The last item shouldn't add a gap potentially.
        // Our logic above adds gap AFTER each spouse row.
        // So `spousesTotalHeight` might have one extra gap at the end?
        // Yes.
        // Let's refine:
        // Total = PersonRow + (Spouse1Row + Gap) + (Spouse2Row + Gap) ...
        // We can just sum them up.

        heightCache.set(cacheKey, totalHeight)
        return totalHeight
    }

    // Recursive Layout
    function layoutSubtree(personId: number, x: number, currentY: number) {
        if (placed.has(personId)) return

        placed.add(personId)

        const allSpouses = spouseMap.get(personId) || []
        const activeSpouses = allSpouses.filter(sid => personById.has(sid) && !placed.has(sid))
        activeSpouses.forEach(s => placed.add(s))

        // const person = personById.get(personId)!

        // Group children
        const children = getSortedChildren(personId)
        const childrenBySpouse = new Map<number, Person[]>()
        const pivotChildren: Person[] = []

        children.forEach(child => {
            let matchedSpouseId: number | undefined
            const parents = [
                parentChildLinks.find(l => l.child_id === child.id)?.father_id,
                parentChildLinks.find(l => l.child_id === child.id)?.mother_id
            ]
            const otherParent = parents.find(p => p && p !== personId)
            if (otherParent && activeSpouses.includes(otherParent)) {
                matchedSpouseId = otherParent
            }

            if (matchedSpouseId) {
                if (!childrenBySpouse.has(matchedSpouseId)) childrenBySpouse.set(matchedSpouseId, [])
                childrenBySpouse.get(matchedSpouseId)!.push(child)
            } else {
                pivotChildren.push(child)
            }
        })

        // Placement Logic
        // Person is at (x, currentY) - but need to vertically align based on children?
        // Simple approach: Top-down flow within the subtree block.

        // 1. Place Person
        // Calculate Person Row Height to know where next spouse starts
        // Pivot Children Height
        // const dummySet = new Set<number>()
        // Note: Recalculating height here might be expensive but safe. 
        // We can't reuse `newVisited` from cache easily. 
        // Just use empty set for helper, assuming cycle checks handled elsewhere or tree is DAG.

        const getListHeight = (list: Person[]) => {
            if (list.length === 0) return 0
            return list.reduce((sum, c) => sum + getSubtreeHeight(c.id, new Set()) + VERTICAL_GAP, 0) - VERTICAL_GAP
        }

        const pivotH = getListHeight(pivotChildren)
        const personRowH = Math.max(NODE_HEIGHT, pivotH)

        // Center Person in the Person Row?
        // If Pivot children take up 500px, Person should be at Y + 500/2 ?
        // Or Top aligned?
        // Standard tree often centers parent relative to children.
        // Standard Person Y (centered in their row)
        let personY = currentY + (personRowH / 2) - (NODE_HEIGHT / 2)

        // Check for Optimization: Monogamy + No Pivot Children
        // We want to bring H and W closer.
        // We can push H down to be just above W.
        const canOptimize = activeSpouses.length === 1 && pivotChildren.length === 0
        let optimizedSpouseY: number | null = null

        if (canOptimize) {
            // Calculate where Spouse WILL be. 
            // Spouse starts at nextY. 
            // Spouse Centered Y = nextY + (spouseRowH / 2) - (NODE_HEIGHT / 2)
            const spouseId = activeSpouses[0]
            const spouseChildren = childrenBySpouse.get(spouseId) || []
            const childH = getListHeight(spouseChildren)
            const rowH = Math.max(NODE_HEIGHT, childH)

            // Standard Spouse Position (Centered on their children block)
            const nextY = currentY + personRowH + VERTICAL_GAP
            const stdSpouseY = nextY + (rowH / 2) - (NODE_HEIGHT / 2)

            // We want H to be at stdSpouseY - NODE_HEIGHT - SPOUSE_GAP
            // But we must ensure H >= currentY (which is 0 relative to this block start)
            // personRowH is NODE_HEIGHT (since pivotChildren empty)
            // nextY is currentY + NODE_HEIGHT + VERTICAL_GAP

            // If H is pushed down, does it overlap anything? 
            // Since pivotChildren empty, space below H (up to nextY) is empty gap.
            // So yes, we can push H down.

            // New Strategy:
            // Force H and W to be close. 
            // H is placed relative to W.
            // W is placed relative to Children.
            // So: 
            optimizedSpouseY = stdSpouseY
            personY = stdSpouseY - NODE_HEIGHT - SPOUSE_GAP
        }

        positions.set(personId, { x, y: personY })

        // Layout Pivot Children
        if (pivotChildren.length > 0) {
            let childY = currentY + (personRowH - pivotH) / 2 // Center the block of children
            const childX = x + NODE_WIDTH + HORIZONTAL_GAP

            pivotChildren.forEach(child => {
                const h = getSubtreeHeight(child.id, new Set())
                layoutSubtree(child.id, childX, childY)
                childY += h + VERTICAL_GAP
            })
        }

        // 2. Place Spouses and their Children
        let nextY = currentY + personRowH + VERTICAL_GAP

        activeSpouses.forEach((spouseId, idx) => {
            const spouseChildren = childrenBySpouse.get(spouseId) || []
            const childH = getListHeight(spouseChildren)
            const rowH = Math.max(NODE_HEIGHT, childH)

            // Place Spouse
            // Spouse X is same as Person X (Stacked)
            let spouseY = nextY + (rowH / 2) - (NODE_HEIGHT / 2)

            // Use optimized position if applicable
            if (canOptimize && idx === 0 && optimizedSpouseY !== null) {
                spouseY = optimizedSpouseY
            }

            positions.set(spouseId, { x, y: spouseY })

            // Create Marriage Node between Person and Spouse?
            // Since they are stacked, maybe a vertical link?
            // Actually, we need a Marriage Node to be the "Source" for children.
            // Let's place Marriage Node horizontally between spouses, or just to the right?
            // If we connect [Person] --vertical-- [Spouse], the children spring from the midpoint.

            // Link Logic:
            // Midpoint between this Spouse and the MAIN Person (personId) ?
            // In Polygamy, usually specific wife connects to husband.
            // Let's place MarriageNode at (X + NODE_WIDTH/2 + small_offset, MidPoint Y)
            // But visually, Husband is far above if many wives.
            // Let's place MarriageNode closer to the Spouse, but connected to Husband?

            // Alternative: MarriageNode is just to the right of the Spouse Row, 
            // but we draw edge from Husband -> MN and Spouse -> MN.
            // Marriage Node Placement
            const pairKey = `${Math.min(personId, spouseId)}-${Math.max(personId, spouseId)}`

            if (canOptimize && idx === 0) {
                // Vertical Placement (Centered between H and W)
                marriageNodes.set(pairKey, {
                    id: `marriage-${pairKey}`,
                    x: x + NODE_WIDTH / 2, // Centered horizontally
                    y: (personY + NODE_HEIGHT + spouseY) / 2, // Midpoint vertically
                    layoutType: 'vertical'
                })
            } else {
                // Standard Side Placement (Right of gap)
                marriageNodes.set(pairKey, {
                    id: `marriage-${pairKey}`,
                    x: x + NODE_WIDTH + 40,
                    y: spouseY + NODE_HEIGHT / 2,
                    layoutType: 'side'
                })
            }

            // Layout Spouse Children
            if (spouseChildren.length > 0) {
                let childY = nextY + (rowH - childH) / 2
                const childX = x + NODE_WIDTH + HORIZONTAL_GAP + 60 // Extra offset for marriage

                spouseChildren.forEach(child => {
                    const h = getSubtreeHeight(child.id, new Set())
                    layoutSubtree(child.id, childX, childY)
                    childY += h + VERTICAL_GAP
                })
            }

            nextY += rowH + VERTICAL_GAP
        })
    }


    // --- Execute Layout ---
    const rootHeights = roots.map(r => getSubtreeHeight(r.id, new Set()))
    // const totalHeight = rootHeights.reduce((sum, h) => sum + h + VERTICAL_GAP, 0)

    let currentY = 0 // Start from Top

    roots.forEach((root, idx) => {
        layoutSubtree(root.id, 0, currentY)
        currentY += rootHeights[idx] + VERTICAL_GAP
    })

    // Handle orphans (if any)
    let orphanY = currentY + 100
    persons.forEach(p => {
        if (!positions.has(p.id)) {
            positions.set(p.id, { x: 0, y: orphanY })
            orphanY += NODE_HEIGHT + VERTICAL_GAP
        }
    })

    // --- Build React Flow Objects ---

    const nodes: TreeNode[] = []
    const edges: TreeEdge[] = []

    // Nodes
    positions.forEach((pos, id) => {
        const person = personById.get(id)
        if (person) {
            nodes.push({
                id: `person-${id}`,
                type: 'personNode',
                position: pos,
                data: { ...person, layoutMode: 'horizontal' }
            })
        }
    })

    marriageNodes.forEach(mn => {
        nodes.push({
            id: mn.id,
            type: 'marriageNode',
            position: { x: mn.x, y: mn.y },
            data: { id: mn.id, layoutType: mn.layoutType }
        })
    })

    // Edges
    const addedEdges = new Set<string>()

    // Marriage Edges
    // Husband -> MN (Bezier/Step)
    // Wife -> MN (Straight/Short)
    marriages.forEach(m => {
        const pairKey = `${Math.min(m.husband_id, m.wife_id)}-${Math.max(m.husband_id, m.wife_id)}`
        const mn = marriageNodes.get(pairKey)
        if (!mn) return

        if (!positions.has(m.husband_id) || !positions.has(m.wife_id)) return

        // check passed

        // Spouse who is "close" to MN (on the same row basically)
        // Based on our logic, MN y is close to Spouse y (stack logic)
        // But we need to check which one is physically closer Y-wise?
        // Actually our logic was: MN Y aligned with Spouse Y center.
        // Wait, if monogamy, Husband and Wife are stacked. MN ??
        // In monogamy loop (activeSpouses), we placed MN at `spouseY + NODE_HEIGHT/2`.
        // So Wife is the one aligned with MN. Husband is above.

        // Determine Top/Bottom nodes for Vertical Layout
        const husbandY = positions.get(m.husband_id)!.y
        const wifeY = positions.get(m.wife_id)!.y

        const topNodeId = husbandY < wifeY ? m.husband_id : m.wife_id
        const bottomNodeId = husbandY < wifeY ? m.wife_id : m.husband_id

        if (mn.layoutType === 'vertical') {
            // Top Node -> MN (Bottom -> Top)
            edges.push({
                id: `e-${topNodeId}-${mn.id}`,
                source: `person-${topNodeId}`,
                target: mn.id,
                sourceHandle: 'bottom',
                targetHandle: 'top',
                type: 'straight',
                style: { stroke: '#ec1325', strokeWidth: 2, strokeDasharray: '5,5' },
            })

            // Bottom Node -> MN (Top-Source -> Bottom-Target)
            edges.push({
                id: `e-${bottomNodeId}-${mn.id}`,
                source: `person-${bottomNodeId}`,
                target: mn.id,
                sourceHandle: 'top-source', // Use the new Source Handle at Top
                targetHandle: 'bottom-target',
                type: 'straight',
                style: { stroke: '#ec1325', strokeWidth: 2, strokeDasharray: '5,5' },
            })
        } else {
            // Standard Layout (Side-by-side or stacked far apart)
            // Husband -> MN (Side)
            edges.push({
                id: `e-${m.husband_id}-${mn.id}`,
                source: `person-${m.husband_id}`,
                target: mn.id,
                sourceHandle: 'right',
                targetHandle: 'top', // Reuse top for entry? Or left? existing logic used Right->Top in one block and Right->Left in other.
                // Let's stick to Right->Top for Husband as it was updated recently 
                type: 'smoothstep',
                style: { stroke: '#ec1325', strokeWidth: 2, strokeDasharray: '5,5' },
            })

            // Wife -> MN (Side)
            edges.push({
                id: `e-${m.wife_id}-${mn.id}`,
                source: `person-${m.wife_id}`,
                target: mn.id,
                sourceHandle: 'right',
                targetHandle: 'left',
                type: 'straight',
                style: { stroke: '#ec1325', strokeWidth: 2, strokeDasharray: '5,5' },
            })
        }
    })

    // Parent -> Child Edges
    parentChildLinks.forEach(link => {
        if (!positions.has(link.child_id)) return

        // From Marriage Node OR Single Parent
        let sourceId = ''

        if (link.father_id && link.mother_id) {
            const pairKey = `${Math.min(link.father_id, link.mother_id)}-${Math.max(link.father_id, link.mother_id)}`
            const mn = marriageNodes.get(pairKey)
            if (mn) sourceId = mn.id
        }

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
                    sourceHandle: 'right',
                    targetHandle: 'left',
                    type: 'smoothstep',
                    style: { stroke: '#896165', strokeWidth: 2 },
                })
                addedEdges.add(edgeId)
            }
        }
    })

    return { nodes, edges }
}
