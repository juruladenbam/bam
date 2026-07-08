import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { divisionApi } from '../api/divisionApi'

export function useDivisions(eventId: number | null) {
  return useQuery({
    queryKey: ['juruladen', 'events', eventId, 'divisions'],
    queryFn: () => divisionApi.list(eventId!).then(r => r.data),
    enabled: !!eventId,
  })
}

export function useCreateDivision(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color?: string; description?: string }) =>
      divisionApi.create(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'divisions'] })
    },
  })
}

export function useUpdateDivision(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ divisionId, data }: { divisionId: number; data: { name?: string; color?: string; description?: string } }) =>
      divisionApi.update(divisionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'divisions'] })
    },
  })
}

export function useDeleteDivision(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (divisionId: number) => divisionApi.delete(divisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'divisions'] })
    },
  })
}

export function useAddMember(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ divisionId, personId, role, responsibilities }: { divisionId: number; personId: number; role: 'ketua' | 'anggota'; responsibilities?: string }) =>
      divisionApi.addMember(divisionId, { person_id: personId, role, responsibilities }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'divisions'] })
    },
  })
}

export function useRemoveMember(eventId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ divisionId, personId }: { divisionId: number; personId: number }) =>
      divisionApi.removeMember(divisionId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juruladen', 'events', eventId, 'divisions'] })
    },
  })
}
