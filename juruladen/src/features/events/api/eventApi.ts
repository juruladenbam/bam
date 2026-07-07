import api from "../../../lib/api";
import type {
  ApiResponse,
  JuruladenEvent,
  ProgressData,
  TimelineData,
} from "../../../types";

export const eventApi = {
  list: (): Promise<ApiResponse<JuruladenEvent[]>> =>
    api.get("/juruladen/events"),

  show: (eventId: number): Promise<ApiResponse<JuruladenEvent>> =>
    api.get(`/juruladen/events/${eventId}`),

  toggleActive: (eventId: number): Promise<ApiResponse<JuruladenEvent>> =>
    api.patch(`/juruladen/events/${eventId}/toggle-active`),

  progress: (eventId: number): Promise<ApiResponse<ProgressData>> =>
    api.get(`/juruladen/events/${eventId}/progress`),

  timeline: (
    eventId: number,
    params?: {
      division?: string;
      status?: string;
      month?: string;
      assignee_id?: number;
    },
  ): Promise<ApiResponse<TimelineData>> =>
    api.get(`/juruladen/events/${eventId}/timeline`, { params }),
};
