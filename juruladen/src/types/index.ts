// ─── API Response Wrappers ────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── User ─────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string | null;
  role: "superadmin" | "admin" | "member";
  person_id: number | null;
}

export interface JuruladenUser {
  id: number;
  name: string;
  email: string | null;
  role: "superadmin" | "admin";
  person_id: number;
  person_name: string;
  nib: string | null;
  has_password: boolean;
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────

export interface CheckNibResponse {
  nib_valid: boolean;
  person_found?: boolean;
  person_name?: string;
  user_registered?: boolean;
  has_password?: boolean;
  next_step?: "login" | "set_password";
}

export interface AuthResult {
  token: string;
  user: User;
}

// ─── Person ───────────────────────────────────────────

export interface PersonSearchResult {
  id: number;
  full_name: string;
  nib: string | null;
  has_user: boolean;
}

// ─── Event ────────────────────────────────────────────

export interface JuruladenEvent {
  id: number;
  slug: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_juruladen_active: boolean;
  budget_total?: number;
  budget_status?: "draft" | "approved" | "closed";
  task_progress?: {
    total: number;
    done: number;
    percentage: number;
  };
}

// ─── Division ─────────────────────────────────────────

export interface Division {
  id: number;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  sort_order: number;
  progress: number;
  task_counts: {
    total: number;
    done: number;
    in_progress: number;
    todo: number;
    blocked: number;
  };
  members: DivisionMember[];
}

export interface DivisionMember {
  id: number;
  person_id: number;
  person_name: string;
  role: "ketua" | "anggota";
  responsibilities: string | null;
}

// ─── Task ─────────────────────────────────────────────

export interface CommitteeTask {
  id: number;
  committee_division_id: number;
  parent_task_id: number | null;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  deadline: string | null;
  assignee_id: number | null;
  assignee?: { id: number; full_name: string; nib: string | null };
  creator?: { id: number; name: string };
  sub_tasks?: CommitteeTask[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Timeline ─────────────────────────────────────────

export interface TimelineTask {
  id: number;
  title: string;
  status: CommitteeTask["status"];
  priority: CommitteeTask["priority"];
  deadline: string | null;
  division: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
  assignee_name: string | null;
}

export interface TimelineData {
  tasks: TimelineTask[];
  grouped_by_date: Record<string, TimelineTask[]>;
}

// ─── Progress ─────────────────────────────────────────

export interface ProgressData {
  overall_progress: number;
  total_tasks: number;
  done_tasks: number;
  divisions: {
    id: number;
    name: string;
    slug: string;
    color: string;
    progress: number;
    task_counts: Division["task_counts"];
  }[];
}

// ─── Rundown ───────────────────────────────────────────

export interface Rundown {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  sort_order: number;
  items: RundownItem[];
}

export interface RundownItem {
  id: number;
  rundown_id: number;
  time_start: string;
  time_end?: string;
  activity_title: string;
  description?: string;
  pic_person_id?: number;
  pic_name?: string;
  pic?: { id: number; full_name: string };
  location_venue?: string;
  sort_order: number;
}

// ─── Guidelines ────────────────────────────────────────

export interface EventGuideline {
  id: number;
  event_id: number;
  type: "juknis" | "juklak";
  content?: string;
}

// ─── Inventory ─────────────────────────────────────────

export interface InventoryCategory {
  id: number;
  event_id: number;
  name: string;
  items: InventoryItem[];
}

export interface InventoryItem {
  id: number;
  inventory_category_id: number;
  name: string;
  quantity_needed: number;
  unit: string;
  source_type: "beli" | "sewa" | "pinjam" | "punya_sendiri";
  source_detail?: string;
  cost_per_unit?: number;
  assigned_to_person_id?: number;
  assigned_person_name?: string;
  assigned_person?: { id: number; full_name: string };
  acquisition_status: "pending" | "delivered" | "returned";
  return_status: "not_applicable" | "pending" | "returned";
  notes?: string;
}

// ─── MC ────────────────────────────────────────────────

export interface McAssignment {
  id: number;
  event_id: number;
  person_id: number;
  person?: { id: number; full_name: string };
  role: "mc_utama" | "co_mc" | "qori" | "tilawah";
  segment_description?: string;
  notes?: string;
}

// ─── Catering ──────────────────────────────────────────

export interface CateringSchedule {
  id: number;
  event_id: number;
  rundown_item_id?: number;
  rundown_label?: string;
  time_serve: string;
  total_cost?: number;
  pic_type?: "person" | "other";
  pic_name?: string;
  sort_order?: number;
  menu_items: CateringMenuItem[];
}

export interface CateringMenuItem {
  id: number;
  menu_category:
    | "makanan_berat"
    | "makanan_ringan"
    | "minuman_es"
    | "minuman_hangat"
    | "snack";
  menu_name: string;
  portion_count: number;
  unit?: string;
  cost_per_portion?: number;
  is_subsidi?: boolean;
  subsidi_source_type?: "person" | "qobilah" | "other";
  subsidi_source_id?: number;
  subsidi_source_name?: string;
  serving_style?: "sendiri2" | "bareng2";
  equipment_needs?: { name: string; quantity: number; unit: string }[];
  subtotal?: number;
  notes?: string;
}
