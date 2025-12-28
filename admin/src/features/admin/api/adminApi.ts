import api from '../../../lib/api'
import type {
    Person,
    Branch,
    Marriage,
    PaginatedResponse,
    ApiResponse,
    PersonFilters,
    MarriageFilters,
    CreatePersonData,
    CreateMarriageData,
} from '../../../types'

// ==================== PERSONS ====================

export async function getPersons(filters: PersonFilters = {}): Promise<PaginatedResponse<Person>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value))
        }
    })
    const response = await api.get(`/persons?${params.toString()}`)
    return response as unknown as PaginatedResponse<Person>
}

export async function getPerson(id: number): Promise<ApiResponse<{ person: Person }>> {
    return api.get(`/persons/${id}`) as unknown as ApiResponse<{ person: Person }>
}

export async function createPerson(data: CreatePersonData): Promise<ApiResponse<Person>> {
    return api.post('/persons', data) as unknown as ApiResponse<Person>
}

export async function updatePerson(id: number, data: Partial<CreatePersonData>): Promise<ApiResponse<Person>> {
    return api.put(`/persons/${id}`, data) as unknown as ApiResponse<Person>
}

export async function deletePerson(id: number): Promise<ApiResponse<null>> {
    return api.delete(`/persons/${id}`) as unknown as ApiResponse<null>
}

export async function searchPersons(query: string, limit = 10, offset = 0): Promise<ApiResponse<{ data: Person[]; has_more: boolean }>> {
    return api.get(`/persons/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`) as unknown as ApiResponse<{ data: Person[]; has_more: boolean }>
}

// ==================== MARRIAGES ====================

export async function getMarriages(filters: MarriageFilters = {}): Promise<PaginatedResponse<Marriage>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value))
        }
    })
    const response = await api.get(`/marriages?${params.toString()}`)
    return response as unknown as PaginatedResponse<Marriage>
}

export async function getMarriage(id: number): Promise<ApiResponse<Marriage>> {
    return api.get(`/marriages/${id}`) as unknown as ApiResponse<Marriage>
}

export async function createMarriage(data: CreateMarriageData): Promise<ApiResponse<Marriage>> {
    return api.post('/marriages', data) as unknown as ApiResponse<Marriage>
}

export async function updateMarriage(id: number, data: Partial<CreateMarriageData>): Promise<ApiResponse<Marriage>> {
    return api.put(`/marriages/${id}`, data) as unknown as ApiResponse<Marriage>
}

export async function deleteMarriage(id: number): Promise<ApiResponse<null>> {
    return api.delete(`/marriages/${id}`) as unknown as ApiResponse<null>
}

export async function addChildToMarriage(marriageId: number, childId: number, birthOrder = 1): Promise<ApiResponse<null>> {
    return api.post(`/marriages/${marriageId}/children`, { child_id: childId, birth_order: birthOrder }) as unknown as ApiResponse<null>
}

// ==================== BRANCHES ====================

export async function getBranches(): Promise<ApiResponse<Branch[]>> {
    return api.get('/branches') as unknown as ApiResponse<Branch[]>
}

export async function getBranch(id: number): Promise<ApiResponse<Branch>> {
    return api.get(`/branches/${id}`) as unknown as ApiResponse<Branch>
}

export const adminApi = {
    // Persons
    getPersons,
    getPerson,
    createPerson,
    updatePerson,
    deletePerson,
    searchPersons,
    // Marriages
    getMarriages,
    getMarriage,
    createMarriage,
    updateMarriage,
    deleteMarriage,
    addChildToMarriage,
    // Branches
    getBranches,
    getBranch,
}

export default adminApi
