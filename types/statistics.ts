export interface StudentInfo {
  id: string
  name: string
  email: string
}

export interface CancellationByWho {
  name: string
  value: number
  percentage: number
}

export interface CancellationByStudent {
  studentId: string
  name: string
  totalSessions: number
  cancelledSessions: number
  cancellationRate: number
}

export interface CancellationData {
  overallRate: number
  byWho: CancellationByWho[]
  byStudent: CancellationByStudent[]
}

export interface PaymentOverviewSlice {
  name: string
  value: number
  amount: number
}

export interface PaymentByStudent {
  studentId: string
  name: string
  totalUnpaid: number
  unpaidSessions: number
}

export interface PaymentOverviewData {
  overview: PaymentOverviewSlice[]
  byStudent: PaymentByStudent[]
}

export interface StudentStat {
  id: string
  name: string
  total_sessions: number
  total_revenue: number
  total_hours: number
  avg_session_duration: number
  is_active: boolean
  frequency: number
}
