import { useState, useMemo, useEffect } from 'react'
import type { Person } from '../types'
import { buildNestedTree, filterTree, type TreeListNode } from '../utils/treeListUtils'

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

interface TreeListSidebarProps {
    persons: Person[]
    parentChildLinks: ParentChildLink[]
    marriages: Marriage[]
    branchId: number
    isOpen: boolean
    onToggle: () => void
    onPersonClick: (personId: number) => void
    onPersonFocus: (personId: number) => void
    isMobile?: boolean
}

export function TreeListSidebar({
    persons,
    parentChildLinks,
    marriages,
    branchId,
    isOpen,
    onToggle,
    onPersonClick,
    onPersonFocus,
    isMobile = false
}: TreeListSidebarProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
    const [initializedExpanded, setInitializedExpanded] = useState(false)

    // Build tree structure
    const tree = useMemo(() =>
        buildNestedTree(persons, parentChildLinks, marriages, branchId),
        [persons, parentChildLinks, marriages, branchId]
    )

    // Initialize expanded state: expand root AND first-level spouses by default
    // This shows Gen 1 root, their spouses, and Gen 2 children
    // Gen 2 children's families (Gen 3+) will be collapsed
    useEffect(() => {
        if (tree.length > 0 && !initializedExpanded) {
            const defaultExpanded = new Set<number>()

            tree.forEach(rootNode => {
                // Expand root
                defaultExpanded.add(rootNode.id)

                // Expand first-level children (spouses of root)
                rootNode.children.forEach(child => {
                    if (child.type === 'spouse') {
                        defaultExpanded.add(child.id)
                    }
                })
            })

            setExpandedIds(defaultExpanded)
            setInitializedExpanded(true)
        }
    }, [tree, initializedExpanded])

    // Filter tree based on search
    const { filteredTree, expandedIds: searchExpandedIds } = useMemo(() => {
        if (!searchTerm.trim()) {
            return { filteredTree: tree, expandedIds: new Set<number>() }
        }
        return filterTree(tree, searchTerm)
    }, [tree, searchTerm])

    // Merge search expanded with user expanded
    const effectiveExpandedIds = useMemo(() => {
        if (searchTerm.trim()) {
            return searchExpandedIds
        }
        return expandedIds
    }, [expandedIds, searchExpandedIds, searchTerm])

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const handleNameClick = (personId: number) => {
        onPersonClick(personId)
        if (isMobile) {
            onToggle() // Close sidebar on mobile after click
        }
    }

    const clearSearch = () => {
        setSearchTerm('')
    }

    // Render a single tree node
    const renderNode = (node: TreeListNode, depth: number = 0) => {
        const hasChildren = node.children.length > 0
        const isExpanded = effectiveExpandedIds.has(node.id)
        const isSpouse = node.type === 'spouse'

        const iconType = isSpouse ? '💍' : node.person.gender === 'male' ? '👤' : '👤'
        const genderColor = isSpouse
            ? 'text-pink-500'
            : node.person.gender === 'male'
                ? 'text-blue-500'
                : 'text-pink-500'

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`
                        flex items-center gap-1 py-1.5 px-2 rounded-lg group
                        hover:bg-[#f8f6f6] transition-colors cursor-pointer
                        ${!node.person.is_alive ? 'opacity-60' : ''}
                    `}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                >
                    {/* Expand/Collapse Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (hasChildren) toggleExpand(node.id)
                        }}
                        className={`
                            size-5 flex items-center justify-center rounded text-[#896165]
                            ${hasChildren ? 'hover:bg-[#e6dbdc]' : 'invisible'}
                        `}
                    >
                        {hasChildren && (
                            <span className={`material-symbols-outlined text-[16px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                chevron_right
                            </span>
                        )}
                    </button>

                    {/* Icon */}
                    <span className={`text-sm ${genderColor}`}>{iconType}</span>

                    {/* Name */}
                    <span
                        onClick={() => handleNameClick(node.id)}
                        className="flex-1 text-sm text-[#181112] truncate hover:text-[#ec1325] transition-colors"
                    >
                        {node.person.full_name}
                        {node.person.nickname && (
                            <span className="text-[#896165] text-xs ml-1">({node.person.nickname})</span>
                        )}
                    </span>

                    {/* Focus Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onPersonFocus(node.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center rounded hover:bg-[#e6dbdc] text-[#896165] hover:text-[#ec1325] transition-all"
                        title="Focus on tree"
                    >
                        <span className="material-symbols-outlined text-[16px]">my_location</span>
                    </button>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div>
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    // Toggle Button (always visible)
    const toggleButton = (
        <button
            onClick={onToggle}
            className={`
                fixed z-20 bg-white shadow-lg border border-[#e6dbdc] rounded-xl size-10 flex items-center justify-center
                hover:border-[#ec1325] hover:text-[#ec1325] transition-all
                ${isMobile ? 'top-4 left-4' : 'top-20 left-4'}
                ${isOpen && !isMobile ? 'left-[308px]' : 'left-4'}
            `}
            title={isOpen ? 'Tutup Daftar' : 'Buka Daftar'}
        >
            <span className="material-symbols-outlined">
                {isOpen ? 'menu_open' : 'menu'}
            </span>
        </button>
    )

    // Mobile: Full screen overlay
    if (isMobile) {
        return (
            <>
                {toggleButton}
                <div
                    className={`
                        fixed inset-0 z-40 bg-white transform transition-transform duration-300 flex flex-col
                        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[#e6dbdc]">
                        <h3 className="text-base font-bold text-[#181112]">Daftar Anggota</h3>
                        <button
                            onClick={onToggle}
                            className="p-2 rounded hover:bg-[#f8f6f6] text-[#896165]"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-[#e6dbdc]">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#896165] text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama..."
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e6dbdc] focus:border-[#ec1325] focus:ring-1 focus:ring-[#ec1325] outline-none text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#896165] hover:text-[#ec1325]"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tree List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredTree.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-[#896165]">
                                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                                <p className="text-sm">Tidak ditemukan</p>
                            </div>
                        ) : (
                            filteredTree.map(node => renderNode(node, 0))
                        )}
                    </div>
                </div>
            </>
        )
    }

    // Desktop: Fixed sidebar
    return (
        <>
            {toggleButton}
            <aside
                className={`
                    fixed top-16 left-0 bottom-0 w-[300px] bg-white border-r border-[#e6dbdc] z-10
                    transform transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#e6dbdc]">
                    <h3 className="text-base font-bold text-[#181112]">Daftar Anggota</h3>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-[#e6dbdc]">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#896165] text-[20px]">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari nama..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e6dbdc] focus:border-[#ec1325] focus:ring-1 focus:ring-[#ec1325] outline-none text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#896165] hover:text-[#ec1325]"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tree List */}
                <div className="flex-1 overflow-y-auto p-2" style={{ height: 'calc(100% - 130px)' }}>
                    {filteredTree.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#896165]">
                            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                            <p className="text-sm">Tidak ditemukan</p>
                        </div>
                    ) : (
                        filteredTree.map(node => renderNode(node, 0))
                    )}
                </div>
            </aside>
        </>
    )
}
