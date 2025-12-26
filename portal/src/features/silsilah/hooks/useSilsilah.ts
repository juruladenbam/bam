import { useQuery } from '@tanstack/react-query'
import { silsilahApi } from '../api/silsilahApi'

export function useBranches() {
    return useQuery({
        queryKey: ['silsilah', 'branches'],
        queryFn: silsilahApi.getBranches,
    })
}

export function useBranch(id: number) {
    return useQuery({
        queryKey: ['silsilah', 'branch', id],
        queryFn: () => silsilahApi.getBranch(id),
        enabled: !!id,
    })
}

export function useTree(branchId?: number) {
    return useQuery({
        queryKey: ['silsilah', 'tree', branchId],
        queryFn: () => silsilahApi.getTree(branchId),
    })
}

export function usePerson(id: number) {
    return useQuery({
        queryKey: ['silsilah', 'person', id],
        queryFn: () => silsilahApi.getPerson(id),
        enabled: !!id,
    })
}

export function useRelationship(personId: number) {
    return useQuery({
        queryKey: ['silsilah', 'relationship', personId],
        queryFn: () => silsilahApi.getRelationship(personId),
        enabled: !!personId,
    })
}
export function useMe() {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: silsilahApi.getMe,
        staleTime: Infinity,
    })
}
