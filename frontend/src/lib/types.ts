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

export interface PaymentDetail {
  id: number
  student_id: number
  student_name: string
  student_grade?: string
  amount: number
  start_date: string
  end_date: string
  is_active: boolean
  payment_method: 'cash' | 'card' | 'transfer'
  sessions_total: number
  sessions_used: number
  created_at: string
  notes?: string
  days_until_expiry?: number
  completion_percentage?: number
}

export interface PaymentFormData {
  student_id: number
  amount: number
  payment_method: 'cash' | 'card' | 'transfer'
  start_date: string
  sessions_total?: number
  notes?: string
}

export interface PaymentStats {
  monthly_revenue: number
  active_payments: number
  average_attendance_rate: number
  goal_achievement_rate: number
  total_students: number
  completed_sessions_this_month: number
}

export interface CalendarEvent {
  id: number
  title: string
  date: string
  type: 'holiday' | 'exam' | 'event' | 'meeting' | 'session_complete' | 'payment_expire' | 'class_day'
  description?: string
  studentId?: number
  studentName?: string
  priority?: 'high' | 'medium' | 'low'
}

export interface SessionProgress {
  studentId: number
  studentName: string
  totalSessions: number
  completedSessions: number
  estimatedCompletionDate: string
  paymentEndDate: string
}

export interface CalendarDayData {
  date: string
  events: CalendarEvent[]
  hasClass: boolean
  hasSessionComplete: boolean
  hasPaymentExpire: boolean
  isToday: boolean
  isCurrentMonth: boolean
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