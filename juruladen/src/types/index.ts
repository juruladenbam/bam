// ─── API Response Wrappers ────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// ─── User ─────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string | null
  role: 'superadmin' | 'admin' | 'member'
  person_id: number | null
}

export interface JuruladenUser {
  id: number
  name: string
  email: string | null
  role: 'superadmin' | 'admin'
  person_id: number
  person_name: string
  nib: string | null
  has_password: boolean
  created_at: string
}

// ─── Auth ─────────────────────────────────────────────

export interface CheckNibResponse {
  nib_valid: boolean
  person_found?: boolean
  person_name?: string
  user_registered?: boolean
  has_password?: boolean
  next_step?: 'login' | 'set_password'
}

export interface AuthResult {
  token: string
  user: User
}

// ─── Person ───────────────────────────────────────────

export interface PersonSearchResult {
  id: number
  full_name: string
  nib: string | null
  has_user: boolean
}

// ─── Event ────────────────────────────────────────────

export interface JuruladenEvent {
  id: number
  slug: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  is_juruladen_active: boolean
  budget_total?: number
  budget_status?: 'draft' | 'approved' | 'closed'
  task_progress?: {
    total: number
    done: number
    percentage: number
  }
}

// ─── Division ─────────────────────────────────────────

export interface Division {
  id: number
  name: string
  slug: string
  color: string
  description: string | null
  sort_order: number
  progress: number
  task_counts: {
    total: number
    done: number
    in_progress: number
    todo: number
    blocked: number
  }
  members: DivisionMember[]
}

export interface DivisionMember {
  id: number
  person_id: number
  person_name: string
  role: 'ketua' | 'anggota'
  responsibilities: string | null
}

// ─── Task ─────────────────────────────────────────────

export interface CommitteeTask {
  id: number
  committee_division_id: number
  parent_task_id: number | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline: string | null
  assignee_id: number | null
  assignee?: { id: number; full_name: string; nib: string | null }
  creator?: { id: number; name: string }
  sub_tasks?: CommitteeTask[]
  sort_order: number
  created_at: string
  updated_at: string
}

// ─── Timeline ─────────────────────────────────────────

export interface TimelineTask {
  id: number
  title: string
  status: CommitteeTask['status']
  priority: CommitteeTask['priority']
  deadline: string | null
  division: {
    id: number
    name: string
    slug: string
    color: string
  }
  assignee_name: string | null
}

export interface TimelineData {
  tasks: TimelineTask[]
  grouped_by_date: Record<string, TimelineTask[]>
}

// ─── Progress ─────────────────────────────────────────

export interface ProgressData {
  overall_progress: number
  total_tasks: number
  done_tasks: number
  divisions: {
    id: number
    name: string
    slug: string
    color: string
    progress: number
    task_counts: Division['task_counts']
  }[]
}
