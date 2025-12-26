const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return data.data
}

export const silsilahApi = {
    // Get all branches with stats
    getBranches: () => fetchApi<{
        branches: import('../types').Branch[]
        stats: {
            total_persons: number
            total_living: number
            total_descendants: number
            total_spouses: number
            total_living_descendants: number
            total_living_spouses: number
        }
    }>('/portal/silsilah'),

    // Get persons in a branch with relationships
    getBranch: (id: number) => fetchApi<{
        branch: import('../types').Branch
        persons: import('../types').Person[]
        parent_child: Array<{
            child_id: number
            marriage_id: number
            father_id: number | null
            mother_id: number | null
        }>
        marriages: Array<{
            id: number
            husband_id: number
            wife_id: number
        }>
    }>(`/portal/silsilah/branch/${id}`),

    // Get tree data for React Flow
    getTree: (branchId?: number) => fetchApi<{
        nodes: import('../types').TreeNode[]
        edges: import('../types').TreeEdge[]
    }>(`/portal/silsilah/tree${branchId ? `?branch_id=${branchId}` : ''}`),

    // Search persons
    search: (query: string) => fetchApi<import('../types').Person[]>(
        `/portal/silsilah/search?q=${encodeURIComponent(query)}`
    ),

    // Get person detail
    getPerson: (id: number) => fetchApi<{
        person: import('../types').Person
        family: {
            spouses: import('../types').Person[]
            children: import('../types').Person[]
            parents: import('../types').Person[]
        }
        relationship?: import('../types').Relationship
    }>(`/portal/persons/${id}`),

    // Calculate relationship
    getRelationship: (personId: number) => fetchApi<import('../types').Relationship>(
        `/portal/relationship/${personId}`
    ),
    // Get logged-in user
    getMe: () => fetchApi<{
        user: any
        person: import('../types').Person
    }>('/portal/me'),
}
