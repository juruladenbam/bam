import { useState, useCallback } from 'react'
import RichTextEditor from '../../../components/editor/RichTextEditor'
import type { SidebarItem } from '../../../features/content/api/contentApi'

interface Props {
    items: SidebarItem[]
    onChange: (items: SidebarItem[]) => void
}

export function EventSidebarManager({ items = [], onChange }: Props) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingItem, setEditingItem] = useState<SidebarItem | null>(null)

    // Form state
    const [newItem, setNewItem] = useState<Partial<SidebarItem>>({
        type: 'info',
        label: '',
        value: '',
        icon: '',
        description: ''
    })

    const handleSave = () => {
        if (!newItem.label || !newItem.value) return alert('Label dan Value wajib diisi')

        if (editingItem) {
            // Update
            const updatedItems = items.map(item =>
                item.id === editingItem.id ? { ...newItem, id: item.id } as SidebarItem : item
            )
            onChange(updatedItems)
            setEditingItem(null)
        } else {
            // Create
            const item: SidebarItem = {
                id: Math.random().toString(36).substr(2, 9),
                type: newItem.type as 'button' | 'info',
                label: newItem.label || '',
                value: newItem.value || '',
                icon: newItem.icon,
                description: newItem.description
            }
            onChange([...items, item])
        }

        // Reset
        setNewItem({ type: 'info', label: '', value: '', icon: '', description: '' })
        setIsAdding(false)
    }

    const handleDelete = (id: string) => {
        if (confirm('Hapus item ini?')) {
            onChange(items.filter(item => item.id !== id))
        }
    }

    const startEdit = (item: SidebarItem) => {
        setNewItem({
            ...item,
            // Ensure description is treated as string for the editor
            description: item.description || ''
        })
        setEditingItem(item)
        setIsAdding(true)
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex >= 0 && targetIndex < newItems.length) {
            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
            onChange(newItems)
        }
    }

    const handleDescriptionChange = useCallback((value: string) => {
        setNewItem(prev => ({ ...prev, description: value }))
    }, [])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#181112]">Informasi Sidebar (Opsional)</h3>
                <button
                    type="button"
                    onClick={() => {
                        setIsAdding(!isAdding)
                        setEditingItem(null)
                        setNewItem({ type: 'info', label: '', value: '', icon: '', description: '' })
                    }}
                    className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isAdding
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-[#ec1325]/10 text-[#ec1325] hover:bg-[#ec1325]/20'
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{isAdding ? 'close' : 'add'}</span>
                    {isAdding ? 'Batal' : 'Tambah Item'}
                </button>
            </div>

            {isAdding && (
                <div key={editingItem ? editingItem.id : 'new-item'} className="bg-gray-50 border border-[#e6dbdc] rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Tipe Item</label>
                            <select
                                value={newItem.type}
                                onChange={e => setNewItem({ ...newItem, type: e.target.value as 'button' | 'info' })}
                                className="w-full px-3 py-2 border rounded text-sm bg-white"
                            >
                                <option value="info">Info List (Teks + Ikon)</option>
                                <option value="button">Tombol Aksi (Link)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Label / Judul</label>
                            <input
                                defaultValue={newItem.label}
                                onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                                placeholder="Contoh: Dress Code atau Daftar Sekarang"
                                className="w-full px-3 py-2 border rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">
                                {newItem.type === 'button' ? 'Link URL' : 'Isi Teks / Value'}
                            </label>
                            {newItem.type === 'button' ? (
                                <input
                                    defaultValue={newItem.value}
                                    onChange={e => setNewItem({ ...newItem, value: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border rounded text-sm"
                                />
                            ) : (
                                <textarea
                                    defaultValue={newItem.value}
                                    onChange={e => setNewItem({ ...newItem, value: e.target.value })}
                                    placeholder="Contoh: Putih (Atasan), Batik (Bawahan)"
                                    className="w-full px-3 py-2 border rounded text-sm font-mono text-xs"
                                    rows={3}
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#896165] mb-1">
                                Icon Name (Material Symbols)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    defaultValue={newItem.icon}
                                    onChange={e => setNewItem({ ...newItem, icon: e.target.value })}
                                    placeholder="checkroom"
                                    className="flex-1 px-3 py-2 border rounded text-sm"
                                />
                                {newItem.icon && (
                                    <div className="size-[38px] flex items-center justify-center bg-white border rounded">
                                        <span className="material-symbols-outlined text-[#ec1325]">{newItem.icon}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Cukup tulis nama icon (pisahkan spasi dengan underscore, misal: <span className="font-mono bg-gray-100 px-1 rounded">checkroom</span> atau <span className="font-mono bg-gray-100 px-1 rounded">add_circle</span>).
                                Lihat daftar di <a href="https://fonts.google.com/icons?icon.set=Material+Symbols" target="_blank" className="underline text-[#ec1325]" rel="noreferrer">Google Fonts</a> (tab "Android" biasanya menampilkan nama yang benar).
                            </p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[#896165] mb-1">Deskripsi Tambahan (Opsional)</label>
                            <div className="border border-[#e6dbdc] rounded-lg bg-white overflow-hidden">
                                <RichTextEditor
                                    key={editingItem ? editingItem.id : 'new-editor'}
                                    value={newItem.description || ''}
                                    onChange={handleDescriptionChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 border border-[#e6dbdc] rounded-lg text-[#181112] font-medium hover:bg-[#f8f6f6] transition-colors text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-[#ec1325] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
                        >
                            {editingItem ? 'Update Item' : 'Simpan Item'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {items.length === 0 && !isAdding && (
                    <div className="text-center py-6 text-[#896165] bg-gray-50 rounded-lg border border-dashed border-[#e6dbdc] text-sm">
                        Belum ada info tambahan di sidebar.
                    </div>
                )}

                {items.map((item, index) => (
                    <div key={item.id} className="bg-white border border-[#e6dbdc] rounded-lg p-3 flex items-center gap-3 group">
                        <div className="flex flex-col gap-1 text-gray-300">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    moveItem(index, 'up')
                                }}
                                disabled={index === 0}
                                className="hover:text-[#181112] disabled:opacity-30 disabled:hover:text-gray-300"
                            >
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    moveItem(index, 'down')
                                }}
                                disabled={index === items.length - 1}
                                className="hover:text-[#181112] disabled:opacity-30 disabled:hover:text-gray-300"
                            >
                                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                            </button>
                        </div>

                        <div className={`p-2 rounded-lg shrink-0 ${item.type === 'button' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-[#ec1325]'}`}>
                            <span className="material-symbols-outlined">
                                {item.type === 'button' ? 'smart_button' : (item.icon || 'info')}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${item.type === 'button' ? 'bg-blue-100/50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}>
                                    {item.type}
                                </span>
                                <h4 className="font-medium text-[#181112] truncate">{item.label}</h4>
                            </div>
                            <p className="text-sm text-[#896165] truncate mt-0.5" title={item.value}>{item.value}</p>
                            {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    startEdit(item)
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDelete(item.id)
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
