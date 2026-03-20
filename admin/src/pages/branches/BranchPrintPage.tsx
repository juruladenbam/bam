import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../features/admin/api/adminApi'
import type { Person, Marriage, Branch } from '../../types'

interface TreeNode {
    person: Person
    spouses: Person[]
    children: TreeNode[]
}

export function BranchPrintPage() {
    const [data, setData] = useState<{
        persons: Person[]
        marriages: Marriage[]
        parent_child: any[]
        branches: Branch[]
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await adminApi.getTreeExport()
                if (response.success) {
                    setData(response.data)
                }
            } catch (err) {
                console.error('Failed to fetch tree data:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const tree = useMemo(() => {
        if (!data) return null

        const { persons, marriages, parent_child } = data
        const personMap = new Map(persons.map(p => [p.id, p]))

        // Find root (Abdul Manan Ali - ID 34 or marked as root)
        const rootPerson = persons.find(p => p.is_root || p.id === 34)
        if (!rootPerson) return null

        // Helper to find spouses
        const getSpouses = (personId: number) => {
            return marriages
                .filter(m => m.husband_id === personId || m.wife_id === personId)
                .map(m => {
                    const spouseId = m.husband_id === personId ? m.wife_id : m.husband_id
                    return personMap.get(spouseId)
                })
                .filter((p): p is Person => !!p)
        }

        // Helper to find children
        const getChildrenNodes = (personId: number): TreeNode[] => {
            const marriagesOfPerson = marriages.filter(m => m.husband_id === personId || m.wife_id === personId)
            const children: TreeNode[] = []

            marriagesOfPerson.forEach(m => {
                const childrenOfMarriage = parent_child
                    .filter(pc => pc.marriage_id === m.id)
                    // Ensure unique children per marriage
                    .map(pc => ({
                        child: personMap.get(pc.child_id),
                        order: pc.birth_order
                    }))
                    .filter((item): item is { child: Person, order: number } => !!item.child)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))

                childrenOfMarriage.forEach(item => {
                    children.push({
                        person: item.child!!,
                        spouses: getSpouses(item.child!!.id),
                        children: getChildrenNodes(item.child!!.id)
                    })
                })
            })

            return children
        }

        return {
            person: rootPerson,
            spouses: getSpouses(rootPerson.id),
            children: getChildrenNodes(rootPerson.id)
        }
    }, [data])

    if (isLoading) return <div className="p-10 text-center">Memuat data silsilah...</div>
    if (!tree) return <div className="p-10 text-center text-red-500">Data root tidak ditemukan (Abdul Manan Ali)</div>

    return (
        <div className="bg-white min-h-screen p-4 md:p-8 font-sans text-[#181112]">
            {/* Print Settings Suggestion */}
            <div className="mb-4 p-4 border border-[#e6dbdc] bg-[#f8f6f6] rounded-lg no-print flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg mb-1">Cetak Bagan Silsilah</h3>
                    <p className="text-sm font-medium">Tips Cetak:</p>
                    <ul className="list-disc list-inside text-xs text-[#896165] mt-1">
                        <li>Gunakan mode <b>Landscape</b> (Lanskap)</li>
                        <li>Gunakan ukuran kertas <b>A3</b> atau <b>A4</b></li>
                        <li>Atur Skala ke <b>"Fit to page"</b> jika terlalu lebar</li>
                    </ul>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 bg-white border border-[#e6dbdc] text-[#181112] rounded font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-[#ec1325] text-white rounded font-medium text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Cetak Sekarang
                    </button>
                </div>
            </div>

            <div className="tree-container overflow-auto pb-20 mt-8">
                {/* Generation 1: Root */}
                <div className="flex flex-col items-center mb-16 relative">
                    <div className="text-center p-5 border-4 border-[#181112] rounded-4xl bg-white shadow-xl min-w-[300px] z-10">
                        <p className="text-xs font-black text-[#ec1325] uppercase tracking-[0.2em] mb-2">Poro Leluhur / Gen 1</p>
                        <h1 className="text-2xl font-black mb-2">{tree.person.full_name.toUpperCase()}</h1>
                        {tree.spouses.length > 0 && (
                            <div className="text-base font-bold text-[#896165] pt-2 border-t-2 border-dashed border-[#e6dbdc]">
                                {tree.spouses.map(s => s.full_name).join(' & ')}
                            </div>
                        )}
                    </div>
                    {/* Master vertical line */}
                    <div className="w-1 h-12 bg-[#181112] mb-0"></div>
                </div>

                {/* Generation 2: Horizontal */}
                <div className="flex flex-row justify-center gap-12 items-start relative px-10">
                    {/* Horizontal connector line for all children */}
                    <div className="absolute top-0 left-20 right-20 h-1 bg-[#181112]"></div>

                    {tree.children.map((childNode, idx) => (
                        <div key={childNode.person.id} className="flex flex-col items-center relative group">
                            {/* Vertical connector from horizontal line to branch box */}
                            <div className="w-1 h-8 bg-[#181112] mb-0"></div>

                            <div className="w-full flex flex-col items-center">
                                {/* Branch Box (Gen 2) */}
                                <div className="p-4 border-2 border-[#ec1325] rounded-2xl bg-white shadow-lg text-center min-w-[220px] mb-8 ring-4 ring-red-50">
                                    <p className="text-[10px] uppercase font-black text-[#ec1325] tracking-widest mb-1">Qobilah {idx + 1}</p>
                                    <h2 className="text-lg font-black text-[#181112] wrap-break-word">{childNode.person.full_name}</h2>
                                    {childNode.spouses.length > 0 && (
                                        <div className="mt-2 text-[10px] font-bold text-[#896165] pt-2 border-t border-red-100 italic">
                                            {childNode.spouses.map(s => s.full_name).join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Vertical Descendants (Gen 3+) */}
                                <div className="w-full border-t border-dashed border-[#e6dbdc] pt-6">
                                    <VerticalDescendants nodes={childNode.children} level={3} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0.5cm; }
                    .tree-container { overflow: visible !important; height: auto !important; margin-top: 0 !important; }
                    .bg-red-50 { background-color: #fef2f2 !important; }
                    .bg-blue-50 { background-color: #eff6ff !important; }
                    .bg-pink-50 { background-color: #fdf2f8 !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .tree-container {
                    min-width: fit-content;
                }
            `}</style>
        </div>
    )
}

function VerticalDescendants({ nodes, level }: { nodes: TreeNode[], level: number }) {
    if (!nodes || nodes.length === 0) return null

    return (
        <div className="flex flex-col gap-4 pl-4 border-l-2 border-[#e6dbdc]">
            {nodes.map(node => (
                <div key={node.person.id} className="relative group">
                    {/* Horizontal connector line */}
                    <div className="absolute -left-4 top-4 w-4 h-[2px] bg-[#e6dbdc]"></div>

                    <div className="flex flex-col">
                        <div className={`p-2.5 border-2 rounded-xl text-xs inline-block shadow-sm transition-all hover:shadow-md ${node.person.gender === 'male'
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-pink-50 border-pink-200 text-pink-900'
                            }`}>
                            <div className="flex items-center gap-2">
                                <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${node.person.gender === 'male' ? 'bg-blue-200' : 'bg-pink-200'
                                    }`}>
                                    {node.person.gender === 'male' ? '♂' : '♀'}
                                </span>
                                <span className="font-black text-[13px] leading-tight">{node.person.full_name}</span>
                                {!node.person.is_alive && (
                                    <span className="text-[14px] text-gray-400" title="Almarhum">☪</span>
                                )}
                            </div>

                            {node.spouses.length > 0 && (
                                <div className={`text-[10px] font-bold mt-2 pt-2 border-t italic ${node.person.gender === 'male' ? 'border-blue-100 text-blue-700/70' : 'border-pink-100 text-pink-700/70'
                                    }`}>
                                    ∞ {node.spouses.map(s => s.full_name).join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Children recursive */}
                        {node.children.length > 0 && (
                            <div className="mt-4">
                                <VerticalDescendants nodes={node.children} level={level + 1} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
