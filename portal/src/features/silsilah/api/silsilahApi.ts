const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return null;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
    }

    // Add CSRF token for non-GET requests
    if (options?.method && options.method !== 'GET' && options.method !== 'HEAD') {
        const csrfToken = getCookie('XSRF-TOKEN')
        if (csrfToken) {
            (headers as any)['X-XSRF-TOKEN'] = csrfToken
        }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    })

    if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            const returnUrl = encodeURIComponent(window.location.href)
            window.location.href = `/login?redirect=${returnUrl}`
            throw new Error('Unauthorized - redirecting to login')
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
            throw new Error('Anda tidak memiliki akses ke halaman ini')
        }

        // Handle 419 CSRF Token Mismatch
        if (response.status === 419) {
            throw new Error('Sesi anda telah berakhir (CSRF), silahkan muat ulang halaman.')
        }

        // Try to parse error message from response
        try {
            const errorData = await response.json()
            // Laravel validation errors
            if (errorData.errors) {
                const firstError = Object.values(errorData.errors)[0]
                throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError))
            }
            // Standard message
            if (errorData.message) {
                throw new Error(errorData.message)
            }
        } catch (e) {
            // If parsing fails and it's not our thrown error, use generic message
            if (e instanceof Error && !e.message.startsWith('API Error')) {
                throw e
            }
        }

        throw new Error(`Terjadi kesalahan pada server (${response.status})`)
    }

    // For 204 No Content, return empty object
    if (response.status === 204) {
        return {} as T
    }

    const data = await response.json()
    return data.data || data // Handle standard wrap or direct response
}

export const silsilahApi = {
    // Login
    login: async (email: string, password: string) => {
        // Get CSRF cookie first
        await fetch(`${API_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
            credentials: 'include',
        })

        return fetchApi<{ user: any }>('/portal/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    },

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

    // Logout
    logout: () => fetchApi('/portal/logout', { method: 'POST' }),
}
