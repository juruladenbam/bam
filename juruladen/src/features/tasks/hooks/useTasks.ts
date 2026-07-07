import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";
import type { CommitteeTask } from "../../../types";

export function useTasks(divisionId: number | null, status?: string) {
  return useQuery({
    queryKey: ["juruladen", "divisions", divisionId, "tasks", { status }],
    queryFn: () => taskApi.list(divisionId!, status).then((r) => r.data),
    enabled: !!divisionId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      divisionId,
      data,
    }: {
      divisionId: number;
      data: Partial<CommitteeTask>;
    }) => taskApi.create(divisionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["juruladen", "divisions", variables.divisionId],
      });
      queryClient.invalidateQueries({ queryKey: ["juruladen", "events"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      divisionId,
      taskId,
      data,
    }: {
      divisionId: number;
      taskId: number;
      data: Partial<CommitteeTask>;
    }) => taskApi.update(divisionId, taskId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["juruladen", "divisions", variables.divisionId],
      });
      queryClient.invalidateQueries({ queryKey: ["juruladen", "events"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      divisionId,
      taskId,
    }: {
      divisionId: number;
      taskId: number;
    }) => taskApi.delete(divisionId, taskId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["juruladen", "divisions", variables.divisionId],
      });
      queryClient.invalidateQueries({ queryKey: ["juruladen", "events"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: number;
      status: CommitteeTask["status"];
    }) => taskApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juruladen", "divisions"] });
      queryClient.invalidateQueries({ queryKey: ["juruladen", "events"] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      tasks: {
        id: number;
        sort_order: number;
        status?: CommitteeTask["status"];
      }[],
    ) => taskApi.reorder(tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juruladen", "divisions"] });
      queryClient.invalidateQueries({ queryKey: ["juruladen", "events"] });
    },
  });
}
