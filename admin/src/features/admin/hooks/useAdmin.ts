import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/adminApi'
import type { PersonFilters, MarriageFilters, CreatePersonData, CreateMarriageData } from '../../../types'

// ==================== PERSONS HOOKS ====================

export function usePersons(filters: PersonFilters = {}) {
    return useQuery({
        queryKey: ['persons', filters],
        queryFn: () => adminApi.getPersons(filters),
    })
}

export function usePerson(id: number) {
    return useQuery({
        queryKey: ['person', id],
        queryFn: () => adminApi.getPerson(id),
        enabled: !!id,
    })
}

export function useCreatePerson() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreatePersonData) => adminApi.createPerson(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['persons'] })
        },
    })
}

export function useUpdatePerson() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreatePersonData> }) =>
            adminApi.updatePerson(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['persons'] })
            queryClient.invalidateQueries({ queryKey: ['person', variables.id] })
        },
    })
}

export function useDeletePerson() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deletePerson(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['persons'] })
        },
    })
}

export function useSearchPersons(query: string, enabled = true) {
    return useQuery({
        queryKey: ['persons', 'search', query],
        queryFn: () => adminApi.searchPersons(query),
        enabled: enabled && query.length >= 2,
    })
}

// ==================== MARRIAGES HOOKS ====================

export function useMarriages(filters: MarriageFilters = {}) {
    return useQuery({
        queryKey: ['marriages', filters],
        queryFn: () => adminApi.getMarriages(filters),
    })
}

export function useMarriage(id: number) {
    return useQuery({
        queryKey: ['marriage', id],
        queryFn: () => adminApi.getMarriage(id),
        enabled: !!id,
    })
}

export function useCreateMarriage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateMarriageData) => adminApi.createMarriage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marriages'] })
        },
    })
}

export function useUpdateMarriage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateMarriageData> }) =>
            adminApi.updateMarriage(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['marriages'] })
            queryClient.invalidateQueries({ queryKey: ['marriage', variables.id] })
        },
    })
}

export function useDeleteMarriage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteMarriage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marriages'] })
        },
    })
}

// ==================== BRANCHES HOOKS ====================

export function useBranches() {
    return useQuery({
        queryKey: ['branches'],
        queryFn: () => adminApi.getBranches(),
    })
}

export function useBranch(id: number) {
    return useQuery({
        queryKey: ['branch', id],
        queryFn: () => adminApi.getBranch(id),
        enabled: !!id,
    })
}

// ==================== DASHBOARD HOOKS ====================

export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: () => adminApi.getDashboard(),
    })
}
