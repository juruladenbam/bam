// Shared types for BAM Family Portal

export interface Person {
  id: number;
  full_name: string;
  nickname?: string;
  gender: 'male' | 'female';
  birth_date?: string;
  birth_place?: string;
  death_date?: string;
  is_alive: boolean;
  photo_url?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  bio?: string;
  generation: number;
  branch_id: number;
  branch?: Branch;
}

export interface Branch {
  id: number;
  name: string;
  order: number;
  description?: string;
}

export interface Marriage {
  id: number;
  husband_id: number;
  wife_id: number;
  husband?: Person;
  wife?: Person;
  marriage_date?: string;
  is_active: boolean;
  divorce_date?: string;
  is_internal: boolean; // Pernikahan sesama keluarga
  notes?: string;
}

export interface ParentChild {
  id: number;
  marriage_id: number;
  child_id: number;
  birth_order: number;
  marriage?: Marriage;
  child?: Person;
}

export interface RelationshipInfo {
  person_a_id: number;
  person_b_id: number;
  relationship_label: string;
  lca_id?: number;
  path_text?: string;
}

export interface Event {
  id: number;
  slug: string;
  name: string;
  type: 'festival' | 'halal_bihalal' | 'youth_camp' | 'other';
  year: number;
  start_date: string;
  end_date: string;
  description?: string;
  location_name?: string;
  location_maps_url?: string;
  is_active: boolean;
  schedules?: EventSchedule[];
}

export interface EventSchedule {
  id: number;
  event_id: number;
  day_sequence: number;
  title: string;
  time_start: string;
  time_end?: string;
  description?: string;
}

export interface HostRotation {
  id: number;
  event_id: number;
  host_person_id: number;
  year: number;
  host?: Person;
}

export interface NewsPost {
  id: number;
  author_id: number;
  slug: string;
  title: string;
  content: string;
  category: 'kelahiran' | 'lelayu' | 'prestasi' | 'umum';
  is_public: boolean;
  published_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'member';
  person_id?: number;
  person?: Person;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
