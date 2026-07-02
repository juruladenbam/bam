export interface RsvpParticipant {
    id: number;
    person_id: number;
    name: string;
    nickname: string;
    email: string | null;
    whatsapp: string | null;
    attendance: 'hadir' | 'tidak_hadir' | null;
    transport_status: string;
    branch_id: number | null;
    branch_name: string | null;
}

export interface RsvpSubmitData {
    registration_id: number;
    person_id: number;
    branch_id: number;
    email: string;
    whatsapp: string;
    attendance: 'hadir' | 'tidak_hadir';
    confirmed?: boolean;
}

export interface RsvpSubmitResponse {
    requires_confirmation?: boolean;
    transport_status?: string;
    message?: string;
    data?: {
        registration: {
            id: number;
            event_id: number;
            name: string;
            email: string;
            whatsapp: string;
            attendance: 'hadir' | 'tidak_hadir';
            status: string;
        };
    };
}
