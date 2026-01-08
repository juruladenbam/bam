export interface EventSchedule {
    id: number;
    event_id: number;
    day_sequence: number;
    title: string;
    description?: string | null;
    time_start?: string;
    time_end?: string | null;
}

export interface Event {
    id: number;
    name: string;
    slug: string;
    type: string;
    year: number;
    description: string;
    thumbnail_url?: string | null;
    start_date: string;
    end_date?: string;
    location_name?: string;
    location_maps_url?: string;
    is_active: boolean;
    meta_data?: Array<{
        id: string;
        icon: string;
        type: string;
        label: string;
        value: string;
        description?: string;
    }>;
    schedules?: EventSchedule[];
}


export interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    thumbnail_url?: string;
    category: string;
    is_public: boolean;
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

