export interface Student {
  id: number
  name: string
  grade: string
  phone: string
  parentPhone?: string
  address?: string
  registeredDate: string
  status: 'active' | 'inactive' | 'graduated'
  monthlyFee: number
}

export interface Attendance {
  id: number
  studentId: number
  date: string
  status: 'present' | 'absent' | 'late'
  time?: string
  notes?: string
}

export interface Payment {
  id: number
  studentId: number
  amount: number
  dueDate: string
  paidDate?: string
  status: 'pending' | 'completed' | 'overdue'
  method?: 'cash' | 'card' | 'transfer'
  notes?: string
}

export interface CalendarEvent {
  id: number
  title: string
  date: string
  type: 'holiday' | 'exam' | 'event' | 'meeting'
  description?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface StudentFormData {
  name: string
  grade: string
  phone: string
  parentPhone?: string
  address?: string
  monthlyFee: number
}