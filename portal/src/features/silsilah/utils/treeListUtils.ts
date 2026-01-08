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

export interface TreeListNode {
    id: number
    person: Person
    type: 'root' | 'spouse' | 'child'
    marriageId?: number
    children: TreeListNode[]
}

export interface FamilyGroup {
    root: Person
    spouseGroups: {
        spouse: Person | null
        marriageId: number | null
        children: Person[]
    }[]
}

/**
 * Build nested tree structure for Family View
 * Structure: Root -> Spouse Groups -> Children (flat per marriage)
 */
export function buildNestedTree(
    persons: Person[],
    parentChildLinks: ParentChildLink[],
    marriages: Marriage[],
    branchId: number
): TreeListNode[] {
    const personById = new Map<number, Person>()
    persons.forEach(p => personById.set(p.id, p))

    // Find root persons (generation 1 in main branch)
    const mainBranchPersons = persons.filter(p => p.branch_id === branchId)
    const minGeneration = Math.min(...mainBranchPersons.map(p => p.generation))
    const roots = mainBranchPersons
        .filter(p => p.generation === minGeneration)
        .sort((a, b) => (a.birth_order ?? 999) - (b.birth_order ?? 999))

    // Build spouse map per person
    const marriagesByPerson = new Map<number, Marriage[]>()
    marriages.forEach(m => {
        // Skip divorced marriages where both are alive
        if (m.is_active === false) {
            const h = personById.get(m.husband_id)
            const w = personById.get(m.wife_id)
            if (h && w && h.is_alive && w.is_alive) return
        }

        if (!marriagesByPerson.has(m.husband_id)) marriagesByPerson.set(m.husband_id, [])
        if (!marriagesByPerson.has(m.wife_id)) marriagesByPerson.set(m.wife_id, [])
        marriagesByPerson.get(m.husband_id)!.push(m)
        marriagesByPerson.get(m.wife_id)!.push(m)
    })

    // Build birth_order lookup from parentChildLinks (source of truth)
    const birthOrderByChild = new Map<number, number>()
    parentChildLinks.forEach(link => {
        if (link.birth_order !== undefined && link.birth_order !== null) {
            birthOrderByChild.set(link.child_id, link.birth_order)
        }
    })

    // Build children by marriage
    const childrenByMarriage = new Map<number, Person[]>()
    const childrenWithUnknownParent = new Map<number, Person[]>() // parent_id -> children

    parentChildLinks.forEach(link => {
        const child = personById.get(link.child_id)
        if (!child) return

        if (link.marriage_id) {
            if (!childrenByMarriage.has(link.marriage_id)) {
                childrenByMarriage.set(link.marriage_id, [])
            }
            const list = childrenByMarriage.get(link.marriage_id)!
            if (!list.find(c => c.id === child.id)) {
                list.push(child)
            }
        } else {
            // Single parent case
            const parentId = link.father_id ?? link.mother_id
            if (parentId) {
                if (!childrenWithUnknownParent.has(parentId)) {
                    childrenWithUnknownParent.set(parentId, [])
                }
                childrenWithUnknownParent.get(parentId)!.push(child)
            }
        }
    })

    // Sort children by birth order from parentChildLinks (source of truth)
    const sortChildren = (children: Person[]) => {
        return children.sort((a, b) => {
            // Use birth_order from parentChildLinks, fallback to person.birth_order
            const aOrder = birthOrderByChild.get(a.id) ?? a.birth_order ?? 999
            const bOrder = birthOrderByChild.get(b.id) ?? b.birth_order ?? 999
            if (aOrder !== bOrder) return aOrder - bOrder
            return a.full_name.localeCompare(b.full_name)
        })
    }

    // Track processed persons to avoid duplicates
    const processed = new Set<number>()

    // Recursive function to build tree node
    function buildNode(person: Person, type: 'root' | 'spouse' | 'child'): TreeListNode {
        processed.add(person.id)

        const node: TreeListNode = {
            id: person.id,
            person,
            type,
            children: []
        }

        // Get marriages for this person
        const personMarriages = marriagesByPerson.get(person.id) || []

        personMarriages.forEach(marriage => {
            const spouseId = marriage.husband_id === person.id ? marriage.wife_id : marriage.husband_id
            const spouse = personById.get(spouseId)

            // Add spouse node if not processed
            if (spouse && !processed.has(spouse.id)) {
                processed.add(spouse.id)
                const spouseNode: TreeListNode = {
                    id: spouse.id,
                    person: spouse,
                    type: 'spouse',
                    marriageId: marriage.id,
                    children: []
                }

                // Add children of this marriage under spouse
                const marriageChildren = childrenByMarriage.get(marriage.id) || []
                sortChildren(marriageChildren).forEach(child => {
                    if (!processed.has(child.id)) {
                        spouseNode.children.push(buildNode(child, 'child'))
                    }
                })

                node.children.push(spouseNode)
            }
        })

        // Add children with unknown parent (single parent case)
        const unknownParentChildren = childrenWithUnknownParent.get(person.id) || []
        sortChildren(unknownParentChildren).forEach(child => {
            if (!processed.has(child.id)) {
                node.children.push(buildNode(child, 'child'))
            }
        })

        return node
    }

    // Build tree from roots
    const tree: TreeListNode[] = []
    roots.forEach(root => {
        if (!processed.has(root.id)) {
            tree.push(buildNode(root, 'root'))
        }
    })

    return tree
}

/**
 * Search and filter tree, returning matching nodes with expanded parents
 */
export function filterTree(
    tree: TreeListNode[],
    searchTerm: string
): { filteredTree: TreeListNode[]; expandedIds: Set<number> } {
    const normalizedSearch = searchTerm.toLowerCase().trim()
    const expandedIds = new Set<number>()

    if (!normalizedSearch) {
        return { filteredTree: tree, expandedIds }
    }

    function filterNode(node: TreeListNode): TreeListNode | null {
        const nameMatch = node.person.full_name.toLowerCase().includes(normalizedSearch) ||
            (node.person.nickname?.toLowerCase().includes(normalizedSearch) ?? false)

        // Recursively filter children
        const filteredChildren: TreeListNode[] = []
        node.children.forEach(child => {
            const filtered = filterNode(child)
            if (filtered) {
                filteredChildren.push(filtered)
            }
        })

        // Include node if name matches or has matching descendants
        if (nameMatch || filteredChildren.length > 0) {
            if (filteredChildren.length > 0) {
                expandedIds.add(node.id)
            }
            return {
                ...node,
                children: filteredChildren
            }
        }

        return null
    }

    const filteredTree: TreeListNode[] = []
    tree.forEach(node => {
        const filtered = filterNode(node)
        if (filtered) {
            expandedIds.add(filtered.id) // Expand root if has matches
            filteredTree.push(filtered)
        }
    })

    return { filteredTree, expandedIds }
}
