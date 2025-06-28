import { Student, Attendance, Payment, CalendarEvent, ApiResponse, StudentFormData } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
        throw new Error(`HTTP error! status: ${response.status}`)
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

  async getStudents(): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>('/students')
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

  async getAttendance(date?: string): Promise<ApiResponse<Attendance[]>> {
    const query = date ? `?date=${date}` : ''
    return this.request<Attendance[]>(`/attendance${query}`)
  }

  async markAttendance(studentId: number, status: 'present' | 'absent' | 'late'): Promise<ApiResponse<Attendance>> {
    return this.request<Attendance>('/attendance', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        status,
        date: new Date().toISOString().split('T')[0],
      }),
    })
  }

  async getPayments(status?: string): Promise<ApiResponse<Payment[]>> {
    const query = status ? `?status=${status}` : ''
    return this.request<Payment[]>(`/payments${query}`)
  }

  async createPayment(payment: Omit<Payment, 'id'>): Promise<ApiResponse<Payment>> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    })
  }

  async markPaymentPaid(id: number): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/payments/${id}/pay`, {
      method: 'PUT',
    })
  }

  async getCalendarEvents(month?: string): Promise<ApiResponse<CalendarEvent[]>> {
    const query = month ? `?month=${month}` : ''
    return this.request<CalendarEvent[]>(`/calendar${query}`)
  }
}

export const api = new ApiClient()