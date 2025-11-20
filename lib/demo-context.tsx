"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Types
export interface DemoStudent {
  id: string
  name: string
  email: string
  phone: string
  grade: string
  subject: string
  hourly_rate: number
  notes?: string
  is_active: boolean
  created_at: string
}

export interface DemoSession {
  id: string
  student_id: string
  student_name: string
  subject: string
  date: string
  start_time: string
  end_time: string
  duration: number
  hourly_rate: number
  total_amount: number
  payment_status: 'paid' | 'pending' | 'cancelled'
  notes?: string
  created_at: string
}

export interface DemoScheduledClass {
  id: string
  student_id: string
  student_name: string
  day_of_week: number // 0-6, 0 is Sunday
  start_time: string
  duration_minutes: number
  is_active: boolean
  created_at: string
}

interface DemoContextType {
  students: DemoStudent[]
  sessions: DemoSession[]
  scheduledClasses: DemoScheduledClass[]
  addStudent: (student: Omit<DemoStudent, 'id' | 'created_at' | 'is_active'>) => void
  updateStudent: (id: string, student: Partial<DemoStudent>) => void
  deleteStudent: (id: string) => void
  addSession: (session: Omit<DemoSession, 'id' | 'created_at'>) => void
  updateSession: (id: string, session: Partial<DemoSession>) => void
  deleteSession: (id: string) => void
  addScheduledClass: (scheduledClass: Omit<DemoScheduledClass, 'id' | 'created_at'>) => void
  updateScheduledClass: (id: string, scheduledClass: Partial<DemoScheduledClass>) => void
  deleteScheduledClass: (id: string) => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

// Mock data
const initialStudents: DemoStudent[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    grade: '10th Grade',
    subject: 'Mathematics',
    hourly_rate: 50,
    notes: 'Struggling with algebra, needs extra help with quadratic equations',
    is_active: true,
    created_at: '2024-09-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'David Chen',
    email: 'david.chen@email.com',
    phone: '+1 (555) 234-5678',
    grade: '11th Grade',
    subject: 'Physics',
    hourly_rate: 60,
    notes: 'Excellent student, preparing for AP Physics exam',
    is_active: true,
    created_at: '2024-09-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.w@email.com',
    phone: '+1 (555) 345-6789',
    grade: '9th Grade',
    subject: 'Chemistry',
    hourly_rate: 55,
    notes: 'Needs help with chemical equations and stoichiometry',
    is_active: true,
    created_at: '2024-10-01T09:00:00Z',
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael.b@email.com',
    phone: '+1 (555) 456-7890',
    grade: '12th Grade',
    subject: 'English',
    hourly_rate: 45,
    notes: 'Working on college essays and SAT prep',
    is_active: true,
    created_at: '2024-10-05T16:00:00Z',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 (555) 567-8901',
    grade: '10th Grade',
    subject: 'History',
    hourly_rate: 48,
    is_active: true,
    created_at: '2024-10-10T11:00:00Z',
  },
]

const initialSessions: DemoSession[] = [
  {
    id: '1',
    student_id: '1',
    student_name: 'Sarah Johnson',
    subject: 'Mathematics',
    date: '2024-10-20',
    start_time: '14:00',
    end_time: '15:00',
    duration: 1,
    hourly_rate: 50,
    total_amount: 50,
    payment_status: 'paid',
    notes: 'Covered quadratic equations',
    created_at: '2024-10-20T14:00:00Z',
  },
  {
    id: '2',
    student_id: '2',
    student_name: 'David Chen',
    subject: 'Physics',
    date: '2024-10-21',
    start_time: '15:30',
    end_time: '17:00',
    duration: 1.5,
    hourly_rate: 60,
    total_amount: 90,
    payment_status: 'paid',
    notes: 'Kinematics and motion problems',
    created_at: '2024-10-21T15:30:00Z',
  },
  {
    id: '3',
    student_id: '3',
    student_name: 'Emma Wilson',
    subject: 'Chemistry',
    date: '2024-10-22',
    start_time: '16:00',
    end_time: '17:00',
    duration: 1,
    hourly_rate: 55,
    total_amount: 55,
    payment_status: 'pending',
    notes: 'Balancing chemical equations',
    created_at: '2024-10-22T16:00:00Z',
  },
  {
    id: '4',
    student_id: '1',
    student_name: 'Sarah Johnson',
    subject: 'Mathematics',
    date: '2024-10-23',
    start_time: '14:00',
    end_time: '15:30',
    duration: 1.5,
    hourly_rate: 50,
    total_amount: 75,
    payment_status: 'paid',
    notes: 'Practice test on algebra',
    created_at: '2024-10-23T14:00:00Z',
  },
  {
    id: '5',
    student_id: '4',
    student_name: 'Michael Brown',
    subject: 'English',
    date: '2024-10-23',
    start_time: '17:00',
    end_time: '18:00',
    duration: 1,
    hourly_rate: 45,
    total_amount: 45,
    payment_status: 'pending',
    notes: 'Essay review and editing',
    created_at: '2024-10-23T17:00:00Z',
  },
  {
    id: '6',
    student_id: '2',
    student_name: 'David Chen',
    subject: 'Physics',
    date: '2024-10-24',
    start_time: '15:00',
    end_time: '16:30',
    duration: 1.5,
    hourly_rate: 60,
    total_amount: 90,
    payment_status: 'paid',
    notes: 'Thermodynamics concepts',
    created_at: '2024-10-24T15:00:00Z',
  },
  {
    id: '7',
    student_id: '5',
    student_name: 'Lisa Anderson',
    subject: 'History',
    date: '2024-10-24',
    start_time: '13:00',
    end_time: '14:00',
    duration: 1,
    hourly_rate: 48,
    total_amount: 48,
    payment_status: 'paid',
    notes: 'World War II discussion',
    created_at: '2024-10-24T13:00:00Z',
  },
]

const initialScheduledClasses: DemoScheduledClass[] = [
  {
    id: '1',
    student_id: '1',
    student_name: 'Sarah Johnson',
    day_of_week: 1, // Monday
    start_time: '16:00',
    duration_minutes: 60,
    is_active: true,
    created_at: '2024-09-15T10:00:00Z',
  },
  {
    id: '2',
    student_id: '2',
    student_name: 'David Chen',
    day_of_week: 3, // Wednesday
    start_time: '15:30',
    duration_minutes: 90,
    is_active: true,
    created_at: '2024-09-20T14:30:00Z',
  },
  {
    id: '3',
    student_id: '3',
    student_name: 'Emma Wilson',
    day_of_week: 4, // Thursday
    start_time: '16:00',
    duration_minutes: 60,
    is_active: true,
    created_at: '2024-10-01T09:00:00Z',
  },
  {
    id: '4',
    student_id: '1',
    student_name: 'Sarah Johnson',
    day_of_week: 4, // Thursday
    start_time: '17:30',
    duration_minutes: 60,
    is_active: true,
    created_at: '2024-09-15T10:00:00Z',
  },
]

export function DemoProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<DemoStudent[]>(initialStudents)
  const [sessions, setSessions] = useState<DemoSession[]>(initialSessions)
  const [scheduledClasses, setScheduledClasses] = useState<DemoScheduledClass[]>(initialScheduledClasses)

  const addStudent = useCallback((studentData: Omit<DemoStudent, 'id' | 'created_at' | 'is_active'>) => {
    const newStudent: DemoStudent = {
      ...studentData,
      id: `student-${Date.now()}`,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    setStudents(prev => [...prev, newStudent])
  }, [])

  const updateStudent = useCallback((id: string, updates: Partial<DemoStudent>) => {
    setStudents(prev => prev.map(student =>
      student.id === id ? { ...student, ...updates } : student
    ))
  }, [])

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id))
    // Also remove associated sessions and scheduled classes
    setSessions(prev => prev.filter(session => session.student_id !== id))
    setScheduledClasses(prev => prev.filter(cls => cls.student_id !== id))
  }, [])

  const addSession = useCallback((sessionData: Omit<DemoSession, 'id' | 'created_at'>) => {
    const newSession: DemoSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    setSessions(prev => [...prev, newSession])
  }, [])

  const updateSession = useCallback((id: string, updates: Partial<DemoSession>) => {
    setSessions(prev => prev.map(session =>
      session.id === id ? { ...session, ...updates } : session
    ))
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id))
  }, [])

  const addScheduledClass = useCallback((classData: Omit<DemoScheduledClass, 'id' | 'created_at'>) => {
    const newClass: DemoScheduledClass = {
      ...classData,
      id: `class-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    setScheduledClasses(prev => [...prev, newClass])
  }, [])

  const updateScheduledClass = useCallback((id: string, updates: Partial<DemoScheduledClass>) => {
    setScheduledClasses(prev => prev.map(cls =>
      cls.id === id ? { ...cls, ...updates } : cls
    ))
  }, [])

  const deleteScheduledClass = useCallback((id: string) => {
    setScheduledClasses(prev => prev.filter(cls => cls.id !== id))
  }, [])

  const value: DemoContextType = {
    students,
    sessions,
    scheduledClasses,
    addStudent,
    updateStudent,
    deleteStudent,
    addSession,
    updateSession,
    deleteSession,
    addScheduledClass,
    updateScheduledClass,
    deleteScheduledClass,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoData() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error('useDemoData must be used within a DemoProvider')
  }
  return context
}

