export interface Person {
    id: number
    full_name: string
    nickname?: string
    gender: 'male' | 'female'
    birth_date?: string
    death_date?: string
    is_alive: boolean
    is_root?: boolean
    generation: number
    birth_order?: number
    branch_id?: number // nullable for external spouses
    parent_marriage_id?: number // derived from parent_child relation
    parents?: Person[] // derived from getParentsAttribute
    photo_url?: string
    branch?: Branch
    created_at?: string
    updated_at?: string
}

export interface Branch {
    id: number
    name: string
    order: number
    description?: string
    persons_count?: number
    living_count?: number
    spouse_count?: number
    spouse_living_count?: number
    root_gender?: 'male' | 'female'
}

export interface Marriage {
    id: number
    husband_id: number
    wife_id: number
    husband?: Person
    wife?: Person
    marriage_date?: string
    divorce_date?: string
    marriage_location?: string
    is_active: boolean
    is_internal: boolean
    children_count?: number
    created_at?: string
    updated_at?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface PersonFilters {
    branch_id?: number
    generation?: number
    gender?: 'male' | 'female'
    is_alive?: boolean
    search?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
    per_page?: number
    page?: number
}

export interface MarriageFilters {
    is_active?: boolean
    is_internal?: boolean
    year?: number
    search?: string
    per_page?: number
    page?: number
}

export interface CreatePersonData {
    full_name: string
    nickname?: string
    gender: 'male' | 'female'
    birth_date?: string
    death_date?: string
    is_alive?: boolean
    is_root?: boolean
    generation?: number
    birth_order?: number
    branch_id?: number | null // optional for external spouses
    parent_marriage_id?: number // for auto-detect branch/generation
}

export interface CreateMarriageData {
    husband_id: number
    wife_id: number
    marriage_date?: string
    marriage_location?: string
    is_active?: boolean
}

export interface User {
    id: number
    name: string
    email: string
    role: string
    person_id?: number
    person?: Person
    created_at?: string
    updated_at?: string
}

export interface LoginCredentials {
    email: string
    password: string
}
