import api from "../../../lib/api";
import type {
  ApiResponse,
  Rundown,
  RundownItem,
  EventGuideline,
  InventoryCategory,
  InventoryItem,
  McAssignment,
  CateringSchedule,
} from "../../../types";

export const acaraApi = {
  // ─── Rundowns ──────────────────────────────────────

  listRundowns: (eventId: number): Promise<ApiResponse<Rundown[]>> =>
    api.get(`/juruladen/events/${eventId}/rundowns`),

  createRundown: (
    eventId: number,
    data: { title: string; description?: string; sort_order?: number },
  ): Promise<ApiResponse<Rundown>> =>
    api.post(`/juruladen/events/${eventId}/rundowns`, data),

  updateRundown: (
    rundownId: number,
    data: { title?: string; description?: string; sort_order?: number },
  ): Promise<ApiResponse<Rundown>> =>
    api.put(`/juruladen/rundowns/${rundownId}`, data),

  deleteRundown: (rundownId: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/rundowns/${rundownId}`),

  // ─── Rundown Items ─────────────────────────────────

  addRundownItem: (
    rundownId: number,
    data: Partial<RundownItem>,
  ): Promise<ApiResponse<RundownItem>> =>
    api.post(`/juruladen/rundowns/${rundownId}/items`, data),

  updateRundownItem: (
    rundownId: number,
    itemId: number,
    data: Partial<RundownItem>,
  ): Promise<ApiResponse<RundownItem>> =>
    api.put(`/juruladen/rundowns/${rundownId}/items/${itemId}`, data),

  deleteRundownItem: (
    rundownId: number,
    itemId: number,
  ): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/rundowns/${rundownId}/items/${itemId}`),

  reorderRundownItems: (
    rundownId: number,
    items: { id: number; sort_order: number }[],
  ): Promise<ApiResponse<null>> =>
    api.post(`/juruladen/rundowns/${rundownId}/reorder`, { items }),

  // ─── Guidelines ────────────────────────────────────

  getGuidelines: (eventId: number): Promise<ApiResponse<EventGuideline[]>> =>
    api.get(`/juruladen/events/${eventId}/guidelines`),

  updateGuideline: (
    eventId: number,
    type: "juknis" | "juklak",
    data: { content?: string },
  ): Promise<ApiResponse<EventGuideline>> =>
    api.put(`/juruladen/events/${eventId}/guidelines/${type}`, data),

  // ─── Inventory ─────────────────────────────────────

  listInventory: (
    eventId: number,
    categoryId?: number,
  ): Promise<ApiResponse<InventoryCategory[]>> =>
    api.get(`/juruladen/events/${eventId}/inventory`, {
      params: categoryId ? { category_id: categoryId } : {},
    }),

  createCategory: (
    eventId: number,
    data: { name: string },
  ): Promise<ApiResponse<InventoryCategory>> =>
    api.post(`/juruladen/events/${eventId}/inventory/categories`, data),

  createItem: (
    categoryId: number,
    data: Partial<InventoryItem>,
  ): Promise<ApiResponse<InventoryItem>> =>
    api.post(`/juruladen/inventory-categories/${categoryId}/items`, data),

  updateItem: (
    itemId: number,
    data: Partial<InventoryItem>,
  ): Promise<ApiResponse<InventoryItem>> =>
    api.put(`/juruladen/inventory-items/${itemId}`, data),

  deleteItem: (itemId: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/inventory-items/${itemId}`),

  updateItemStatus: (
    itemId: number,
    data: { acquisition_status?: string; return_status?: string },
  ): Promise<ApiResponse<InventoryItem>> =>
    api.patch(`/juruladen/inventory-items/${itemId}/status`, data),

  // ─── MC Assignments ────────────────────────────────

  listMcAssignments: (eventId: number): Promise<ApiResponse<McAssignment[]>> =>
    api.get(`/juruladen/events/${eventId}/mc-assignments`),

  createMcAssignment: (
    eventId: number,
    data: Partial<McAssignment>,
  ): Promise<ApiResponse<McAssignment>> =>
    api.post(`/juruladen/events/${eventId}/mc-assignments`, data),

  updateMcAssignment: (
    id: number,
    data: Partial<McAssignment>,
  ): Promise<ApiResponse<McAssignment>> =>
    api.put(`/juruladen/mc-assignments/${id}`, data),

  deleteMcAssignment: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/mc-assignments/${id}`),

  // ─── Catering ──────────────────────────────────────

  listCatering: (eventId: number): Promise<ApiResponse<CateringSchedule[]>> =>
    api.get(`/juruladen/events/${eventId}/catering`),

  createCatering: (
    eventId: number,
    data: Partial<CateringSchedule>,
  ): Promise<ApiResponse<CateringSchedule>> =>
    api.post(`/juruladen/events/${eventId}/catering`, data),

  updateCatering: (
    id: number,
    data: Partial<CateringSchedule>,
  ): Promise<ApiResponse<CateringSchedule>> =>
    api.put(`/juruladen/catering/${id}`, data),

  deleteCatering: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/catering/${id}`),

  addMenuItem: (scheduleId: number, data: any): Promise<ApiResponse<any>> =>
    api.post(`/juruladen/catering/${scheduleId}/menu-items`, data),

  updateMenuItem: (itemId: number, data: any): Promise<ApiResponse<any>> =>
    api.put(`/juruladen/catering-menu-items/${itemId}`, data),

  deleteMenuItem: (itemId: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/catering-menu-items/${itemId}`),
};
