export interface Event {
    id: number;
    name: string;
    slug: string;
    year: number;
    description: string;
    thumbnail_url?: string;
    start_date: string;
    end_date?: string;
    location?: string;
    is_active: boolean;
}

export interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    thumbnail_url?: string;
    category: string;
    is_published: boolean;
    published_at?: string;
    claps: number;
}

export interface Branch {
    id: number;
    name: string;
    order: number;
    description?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
