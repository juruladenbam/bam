const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
import { getNibSession } from '../../../services/nibSession'

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return null;
}

export interface FetchApiOptions extends RequestInit {
    skipAuthRedirect?: boolean;
}

export async function fetchApi<T>(endpoint: string, options?: FetchApiOptions): Promise<T> {
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

    // Add NIB Session ID header if available (for NIB-linked features in guest mode)
    const nibSession = getNibSession();
    if (nibSession?.person_id) {
        (headers as any)['X-Viewer-Person-Id'] = String(nibSession.person_id);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    })

    if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
            // Don't auto-redirect here - let AuthGuard handle it
            // This prevents redirect loops when login is disabled
            throw new Error('Unauthorized');
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

const getCsrfUrl = () => {
    try {
        const url = new URL(API_URL)
        return `${url.origin}/sanctum/csrf-cookie`
    } catch {
        return `${API_URL.replace(/\/api\/?$/, '')}/sanctum/csrf-cookie`
    }
}

export const silsilahApi = {
    login: async (email: string, password: string) => {
        // Get CSRF cookie first
        await fetch(getCsrfUrl(), {
            credentials: 'include',
        })

        return fetchApi<{ user: any }>('/portal/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    },

    // Register
    register: async (data: any) => {
        // Get CSRF cookie first (same as login)
        await fetch(getCsrfUrl(), {
            credentials: 'include',
        })

        return fetchApi<{ user: any }>('/portal/register', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    // Claim person profile
    claimPerson: (personId: number) => fetchApi<{ user: any, person: any }>('/portal/me/claim', {
        method: 'POST',
        body: JSON.stringify({ person_id: personId })
    }),

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
            total_kk_utuh: number
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
            is_active: boolean
        }>
    }>(`/portal/silsilah/branch/${id}`),

    // Get tree data for React Flow
    getTree: (branchId?: number) => fetchApi<{
        nodes: import('../types').TreeNode[]
        edges: import('../types').TreeEdge[]
    }>(`/portal/silsilah/tree${branchId ? `?branch_id=${branchId}` : ''}`),

    // Search persons
    search: (query: string, gender?: 'male' | 'female') => fetchApi<import('../types').Person[]>(
        `/portal/silsilah/search?q=${encodeURIComponent(query)}${gender ? `&gender=${gender}` : ''}`
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

    // Get logged-in user (Modified to support skipAuthRedirect)
    getMe: (options?: FetchApiOptions) => fetchApi<{
        user: any
        person: import('../types').Person
    }>('/portal/me', options),

    // Logout
    logout: () => fetchApi('/portal/logout', { method: 'POST' }),

    // --- New Optional Login Module Endpoints ---

    // Get Portal Settings (Login enabled, NIB claiming enabled)
    getPortalSettings: () => fetchApi<{
        login_enabled: boolean
        nib_claiming_enabled: boolean
    }>('/portal/settings/mode'),

    // Validate NIB
    validateNib: (nib: string) => fetchApi<{
        valid: boolean
        preview?: {
            id: number
            full_name: string
            nickname: string | null
            gender: 'male' | 'female'
            generation: number
            branch: { id: number; name: string } | null
            is_alive: boolean
        }
        error?: string
    }>('/portal/nib/validate', {
        method: 'POST',
        body: JSON.stringify({ nib })
    }),

    // Link NIB
    linkNib: (nib: string) => fetchApi<{
        success: boolean
        session: import('../../../services/nibSession').NibSession
    }>('/portal/nib/link', {
        method: 'POST',
        body: JSON.stringify({ nib })
    }),

    // Get NIB Guide
    getNibGuide: (nib?: string) => fetchApi<{
        pattern: { format: string, description: string }
        segments: Array<{
            position: string
            label: string
            description: string
            example: string
            color: string
        }>
        examples: Array<any>
        parsed_input: Array<any>
    }>(`/portal/nib/guide${nib ? `?nib=${nib}` : ''}`),
}
