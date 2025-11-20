export interface Student {
    id: string
    name: string
    email?: string
    phone?: string
    hourly_rate: number
    is_active: boolean
    created_at?: string
    user_id?: string
}

export interface Session {
    id: string
    student_id: string
    student_name: string
    date: string
    duration_minutes: number
    hourly_rate: number
    total_amount: number
    is_paid: boolean
    notes: string
    created_at?: string
    is_cancelled: boolean
    cancelled_by?: "teacher" | "student" | null
    user_id: string
}

export interface UserSettings {
    id: string
    user_id: string
    full_name: string
    currency: string
    theme: "light" | "dark" | "system"
    email_notifications: boolean
}
