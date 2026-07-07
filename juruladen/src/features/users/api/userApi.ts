import api from "../../../lib/api";
import type {
  ApiResponse,
  JuruladenUser,
  PersonSearchResult,
} from "../../../types";

export const userApi = {
  list: (): Promise<ApiResponse<JuruladenUser[]>> =>
    api.get("/juruladen/users"),

  create: (
    personId: number,
    role: "admin" | "superadmin",
  ): Promise<ApiResponse<JuruladenUser>> =>
    api.post("/juruladen/users", { person_id: personId, role }),

  resetPassword: (userId: number): Promise<ApiResponse<null>> =>
    api.post(`/juruladen/users/${userId}/reset-password`),

  delete: (userId: number): Promise<ApiResponse<null>> =>
    api.delete(`/juruladen/users/${userId}`),

  searchPerson: (
    query: string,
    juruladenOnly = false,
  ): Promise<ApiResponse<PersonSearchResult[]>> =>
    api.get("/juruladen/users/search-person", {
      params: { q: query, juruladen_only: juruladenOnly ? 1 : 0 },
    }),
};
