// AppointmentStatus represents the lifecycle of a session on the calendar.
export type AppointmentStatus = "confirmado" | "pendente" | "cancelado" | "faltou";

// Appointment is the core entity rendered on the weekly grid and detail screens.
// Dates use "DD-MM-YYYY"; times use "HH:mm" in 24h format.
export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    /** "DD-MM-YYYY" */
    date: string;
    /** "HH:mm" (24h) */
    start: string;
    /** "HH:mm" (24h) */
    end: string;
    status: AppointmentStatus;
    price?: number;
    notes?: string;
    sessionValue?: number;
    isSocial: boolean;
}

