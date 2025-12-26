export interface Person {
    id: number
    legacy_id?: string
    full_name: string
    nickname?: string
    gender: 'male' | 'female'
    birth_date?: string
    death_date?: string
    is_alive: boolean
    photo_url?: string
    bio?: string
    generation: number
    birth_order?: number
    branch_id: number
    branch?: Branch
}

export interface Branch {
    id: number
    name: string
    order: number
    description?: string
    persons_count?: number
    living_count?: number
    root_gender?: 'male' | 'female'
    spouse_count?: number
}

export interface Marriage {
    id: number
    husband_id: number
    wife_id: number
    husband?: Person
    wife?: Person
    marriage_date?: string
    is_active: boolean
    is_internal: boolean
    children?: Person[]
}

export interface Relationship {
    relationship: string
    label: string
    label_javanese?: string
    sapaan?: string
    lca_id?: number
    lca_name?: string
    distance_a?: number
    distance_b?: number
    path?: {
        from: string
        to: string
        via: string
        description: string
    }
}

export interface TreeNode {
    id: string
    type: 'personNode' | 'marriageNode' | 'ghostNode'
    position: { x: number; y: number }
    data: any
}

export interface TreeEdge {
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
    type?: string
    style?: Record<string, unknown>
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}
