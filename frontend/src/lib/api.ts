import { Student, Attendance, Payment, CalendarEvent, ApiResponse, StudentFormData } from './types'

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    throw new ApiError(response.status, `API request failed: ${response.statusText}`)
  }

  return response.json()
}

// 대시보드 API
export const dashboardApi = {
  // 오늘 출석 현황
  getTodayAttendance: () => 
    fetchApi<any>('/attendance/today'),

  // 만료 예정 결제
  getExpiringPayments: (days: number = 7) => 
    fetchApi<any>(`/payments/expiring?days=${days}`),

  // 활성 학생 수
  getActiveStudents: () => 
    fetchApi<any>('/students?is_active=true'),

  // 결제/매출 통계
  getPaymentStats: (period: 'monthly' | 'quarterly' = 'monthly') => 
    fetchApi<any>(`/payments/stats?period=${period}`),
}

// 기존 ApiClient 클래스 (호환성 유지)
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API 에러 [${response.status}]:`, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // 학생 API
  async getStudents(params?: {
    search?: string
    is_active?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.is_active !== undefined) searchParams.append('is_active', String(params.is_active))
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.offset) searchParams.append('offset', String(params.offset))
    
    return this.request<any>(`/students?${searchParams}`)
  }

  async getStudent(id: number): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/students/${id}`)
  }

  async createStudent(data: StudentFormData): Promise<ApiResponse<Student>> {
    return this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateStudent(id: number, data: Partial<StudentFormData>): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteStudent(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/students/${id}`, {
      method: 'DELETE',
    })
  }

  // 출석 API
  async getAttendance(params?: {
    date_filter?: string
    student_id?: number
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Attendance[]>> {
    const searchParams = new URLSearchParams()
    if (params?.date_filter) searchParams.append('date_filter', params.date_filter)
    if (params?.student_id) searchParams.append('student_id', String(params.student_id))
    if (params?.start_date) searchParams.append('start_date', params.start_date)
    if (params?.end_date) searchParams.append('end_date', params.end_date)
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.offset) searchParams.append('offset', String(params.offset))
    
    return this.request<Attendance[]>(`/attendance?${searchParams}`)
  }

  async markAttendance(data: {
    student_id: number
    date: string
    status: 'present' | 'absent' | 'late' | 'early_leave'
    time_in?: string
    note?: string
  }): Promise<ApiResponse<Attendance>> {
    return this.request<Attendance>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAttendance(id: number, data: {
    student_id: number
    date: string
    status: 'present' | 'absent' | 'late' | 'early_leave'
    time_in?: string
    note?: string
  }): Promise<ApiResponse<Attendance>> {
    return this.request<Attendance>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getTodayAttendance(): Promise<ApiResponse<any>> {
    return this.request<any>('/attendance/today')
  }

  // 결제 API
  async getPayments(params?: {
    student_id?: number
    is_active?: boolean
    expires_within_days?: number
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Payment[]>> {
    const searchParams = new URLSearchParams()
    if (params?.student_id) searchParams.append('student_id', String(params.student_id))
    if (params?.is_active !== undefined) searchParams.append('is_active', String(params.is_active))
    if (params?.expires_within_days) searchParams.append('expires_within_days', String(params.expires_within_days))
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.offset) searchParams.append('offset', String(params.offset))
    
    return this.request<Payment[]>(`/payments?${searchParams}`)
  }

  async createPayment(data: any): Promise<ApiResponse<Payment>> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getExpiringPayments(days: number = 7): Promise<ApiResponse<any>> {
    return this.request<any>(`/payments/expiring?days=${days}`)
  }

  async getCalendarEvents(month?: string): Promise<ApiResponse<CalendarEvent[]>> {
    const query = month ? `?month=${month}` : ''
    return this.request<CalendarEvent[]>(`/calendar${query}`)
  }
}

export const api = new ApiClient()
export { ApiError }