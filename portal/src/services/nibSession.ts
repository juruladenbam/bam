export interface NibSession {
    nib: string;
    person_id: number;
    person_name: string;
    photo_url?: string | null;
    branch_name: string;
    generation: number;
    gender: 'male' | 'female';
    linked_at: string;
}

const STORAGE_KEY = 'bam_portal_nib_session';

export function saveNibSession(session: NibSession): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
        console.error('Failed to save NIB session:', error);
    }
}

export function getNibSession(): NibSession | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as NibSession;
    } catch (error) {
        console.error('Failed to parse NIB session:', error);
        return null;
    }
}

export function clearNibSession(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear NIB session:', error);
    }
}

export function hasNibSession(): boolean {
    return !!getNibSession();
}
