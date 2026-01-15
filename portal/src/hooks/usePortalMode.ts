import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { silsilahApi } from '../features/silsilah/api/silsilahApi';
import { getNibSession, clearNibSession, saveNibSession } from '../services/nibSession';
import type { NibSession } from '../services/nibSession';
import type { Person } from '../features/silsilah/types';

export interface PortalMode {
    loginEnabled: boolean;
    nibClaimingEnabled: boolean;
    isGuest: boolean;
    isAuthenticated: boolean;
    isNibLinked: boolean;
    linkedPerson: Person | null;
    isLoading: boolean;
    user: any;
    linkNib: (nib: string) => Promise<void>;
    unlinkNib: () => void;
}

export function usePortalMode(): PortalMode {
    // 1. Get Portal Settings - NO CACHING to ensure fresh data every time
    const { data: settings, isLoading: settingsLoading, isSuccess: settingsSuccess } = useQuery({
        queryKey: ['portal-settings'],
        queryFn: silsilahApi.getPortalSettings,
        staleTime: 0,
        gcTime: 0, // Don't cache at all (formerly cacheTime)
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    // Only use settings data if query was successful (not from stale cache)
    const isSettingsReady = settingsSuccess && !settingsLoading;
    const loginEnabled = isSettingsReady ? (settings?.login_enabled ?? true) : true;
    const nibClaimingEnabled = isSettingsReady ? (settings?.nib_claiming_enabled ?? true) : true;

    // 2. Get User (only if login is enabled AND settings are READY - not stale)
    // We intentionally ignore 401 error here by using skipAuthRedirect
    const { data: authData, isLoading: authLoading } = useQuery({
        queryKey: ['auth', 'me'], // Same key as useMe hook to share cache
        queryFn: () => silsilahApi.getMe({ skipAuthRedirect: true }),
        retry: false,
        // Only fetch if: settings ready (not stale) AND login is enabled
        enabled: isSettingsReady && loginEnabled,
        staleTime: 5 * 60 * 1000,
    });



    // 3. NIB Session State
    const [nibSession, setNibSession] = useState<NibSession | null>(() => getNibSession());

    // Update session state if storage changes (multi-tab support)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'bam_portal_nib_session') {
                setNibSession(getNibSession());
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Derived States
    // If we have authData.user, we are definitely authenticated
    const isAuthenticated = !!authData?.user;

    // If we are NOT authenticated, but have NIB session, we are NIB Linked
    // (Note: If login is enabled but user is not logged in, NIB link is ignored for now 
    // depending on requirements, but usually NIB link is alternative to login.
    // If login is enabled, can user use NIB link?
    // Plan says: "When login is disabled, users can access the portal by linking their NIB."
    // Implies NIB is backup. But code allows NIB session to exist.
    // Let's assume NIB is valid mainly when login is disabled OR user isn't logged in.)
    const isNibLinked = !isAuthenticated && !!nibSession;

    const isGuest = !isAuthenticated && !isNibLinked;

    // determine linked person
    let linkedPerson: Person | null = null;

    if (isAuthenticated && authData?.person) {
        linkedPerson = authData.person;
    } else if (isNibLinked && nibSession) {
        // Construct partial person from session
        linkedPerson = {
            id: nibSession.person_id,
            full_name: nibSession.person_name,
            photo_url: nibSession.photo_url,
            gender: nibSession.gender,
            generation: nibSession.generation,
            branch_id: 0, // Unknown
            is_alive: true, // Assumed
            // Add dummy values for required fields
            branch: { id: 0, name: nibSession.branch_name, order: 0 },
        } as Person;
    }

    const linkNib = useCallback(async (nib: string) => {
        const response = await silsilahApi.linkNib(nib);
        if (response.success && response.session) {
            saveNibSession(response.session);
            setNibSession(response.session);
        } else {
            throw new Error('Gagal menautkan NIB');
        }
    }, []);

    const unlinkNib = useCallback(() => {
        clearNibSession();
        setNibSession(null);
    }, []);

    return {
        loginEnabled,
        nibClaimingEnabled,
        isGuest,
        isAuthenticated,
        isNibLinked,
        linkedPerson,
        isLoading: !isSettingsReady || (loginEnabled && authLoading),
        user: authData?.user,
        linkNib,
        unlinkNib,
    };
}
