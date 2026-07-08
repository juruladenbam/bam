import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";

export function useUsers() {
  return useQuery({
    queryKey: ["juruladen", "users"],
    queryFn: () => userApi.list().then((r) => r.data),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      personId,
      role,
    }: {
      personId: number;
      role: "admin" | "superadmin";
    }) => userApi.create(personId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juruladen", "users"] });
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => userApi.resetPassword(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juruladen", "users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => userApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juruladen", "users"] });
    },
  });
}

export function useSearchPerson() {
  return useMutation({
    mutationFn: ({
      query,
      juruladenOnly = false,
    }: {
      query: string;
      juruladenOnly?: boolean;
    }) => userApi.searchPerson(query, juruladenOnly),
  });
}
