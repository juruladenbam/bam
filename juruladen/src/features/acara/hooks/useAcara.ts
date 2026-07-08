import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { acaraApi } from '../api/acaraApi'
import type { RundownItem, InventoryItem, McAssignment, CateringSchedule } from '../../../types'

// ═══════════════════════════════════════════════
// Rundowns
// ═══════════════════════════════════════════════

export function useRundowns(eventId: number | null) {
  return useQuery({
    queryKey: ['juruladen', 'events', eventId, 'rundowns'],
    queryFn: () => acaraApi.listRundowns(eventId!).then(r => r.data),
    enabled: !!eventId,
  })
}

export function useCreateRundown(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      acaraApi.createRundown(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'rundowns'] })
    },
  })
}

export function useUpdateRundown(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rundownId, data }: { rundownId: number; data: { title?: string; description?: string; sort_order?: number } }) =>
      acaraApi.updateRundown(rundownId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'rundowns'] })
    },
  })
}

export function useDeleteRundown(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rundownId: number) => acaraApi.deleteRundown(rundownId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'rundowns'] })
    },
  })
}

// ─── Rundown Items ────────────────────────────

export function useAddRundownItem(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rundownId, data }: { rundownId: number; data: Partial<RundownItem> }) =>
      acaraApi.addRundownItem(rundownId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'rundowns'] })
    },
  })
}

export function useUpdateRundownItem(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rundownId, itemId, data }: { rundownId: number; itemId: number; data: Partial<RundownItem> }) =>
      acaraApi.updateRundownItem(rundownId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'rundowns'] })
    },
  })
}

export function useDeleteRundownItem(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rundownId, itemId }: { rundownId: number; itemId: number }) =>
      acaraApi.deleteRundownItem(rundownId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'rundowns'] })
    },
  })
}

export function useReorderRundownItems(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rundownId, items }: { rundownId: number; items: { id: number; sort_order: number }[] }) =>
      acaraApi.reorderRundownItems(rundownId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'rundowns'] })
    },
  })
}

// ═══════════════════════════════════════════════
// Guidelines
// ═══════════════════════════════════════════════

export function useGuidelines(eventId: number | null) {
  return useQuery({
    queryKey: ['juruladen', 'events', eventId, 'guidelines'],
    queryFn: () => acaraApi.getGuidelines(eventId!).then(r => r.data),
    enabled: !!eventId,
  })
}

export function useUpdateGuideline(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, data }: { type: 'juknis' | 'juklak'; data: { content?: string } }) =>
      acaraApi.updateGuideline(eventId, type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'guidelines'] })
    },
  })
}

// ═══════════════════════════════════════════════
// Inventory
// ═══════════════════════════════════════════════

export function useInventory(eventId: number | null, categoryId?: number) {
  return useQuery({
    queryKey: ['juruladen', 'events', eventId, 'inventory', { categoryId }],
    queryFn: () => acaraApi.listInventory(eventId!, categoryId).then(r => r.data),
    enabled: !!eventId,
  })
}

export function useCreateCategory(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string }) => acaraApi.createCategory(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'inventory'] })
    },
  })
}

export function useCreateInventoryItem(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: Partial<InventoryItem> }) =>
      acaraApi.createItem(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'inventory'] })
    },
  })
}

export function useUpdateInventoryItem(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: Partial<InventoryItem> }) =>
      acaraApi.updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'inventory'] })
    },
  })
}

export function useDeleteInventoryItem(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => acaraApi.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'inventory'] })
    },
  })
}

export function useUpdateInventoryStatus(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: { acquisition_status?: string; return_status?: string } }) =>
      acaraApi.updateItemStatus(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'inventory'] })
    },
  })
}

// ═══════════════════════════════════════════════
// MC Assignments
// ═══════════════════════════════════════════════

export function useMcAssignments(eventId: number | null) {
  return useQuery({
    queryKey: ['juruladen', 'events', eventId, 'mc-assignments'],
    queryFn: () => acaraApi.listMcAssignments(eventId!).then(r => r.data),
    enabled: !!eventId,
  })
}

export function useCreateMcAssignment(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<McAssignment>) => acaraApi.createMcAssignment(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'mc-assignments'] })
    },
  })
}

export function useUpdateMcAssignment(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<McAssignment> }) =>
      acaraApi.updateMcAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'mc-assignments'] })
    },
  })
}

export function useDeleteMcAssignment(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => acaraApi.deleteMcAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'mc-assignments'] })
    },
  })
}

// ═══════════════════════════════════════════════
// Catering
// ═══════════════════════════════════════════════

export function useCatering(eventId: number | null) {
  return useQuery({
    queryKey: ['juruladen', 'events', eventId, 'catering'],
    queryFn: () => acaraApi.listCatering(eventId!).then(r => r.data),
    enabled: !!eventId,
  })
}

export function useCreateCatering(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CateringSchedule>) => acaraApi.createCatering(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'catering'] })
    },
  })
}

export function useUpdateCatering(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CateringSchedule> }) =>
      acaraApi.updateCatering(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'catering'] })
    },
  })
}

export function useDeleteCatering(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => acaraApi.deleteCatering(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'catering'] })
    },
  })
}
