'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Student {
  id: number
  name: string
  grade?: string
  phone?: string
  parent_phone?: string
  subjects?: string[]
  is_active: boolean
  created_at: string
  memo?: string
  schedule?: {
    [key: string]: string
  }
  attendance_rate?: number
  active_payment?: {
    id: number
    amount: number
    start_date: string
    end_date: string
    days_until_expiry: number
    progress_percentage: number
    sessions_total: number
    sessions_used: number
  }
}

interface AttendanceRecord {
  id: number
  date: string
  status: 'present' | 'absent' | 'late' | 'early_leave'
  time_in?: string
  note?: string
}

interface PaymentRecord {
  id: number
  amount: number
  start_date: string
  end_date: string
  is_active: boolean
  sessions_total: number
  sessions_used: number
  created_at: string
}

const weekDayNames: { [key: string]: string } = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일'
}

const statusColors = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  early_leave: 'bg-orange-100 text-orange-800'
}

const statusLabels = {
  present: '출석',
  absent: '결석',
  late: '지각',
  early_leave: '조퇴'
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const studentId = parseInt(params.id)
  
  // State
  const [student, setStudent] = useState<Student | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'payments'>('info')

  // 데이터 로드
  useEffect(() => {
    loadStudentData()
  }, [studentId])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 병렬로 데이터 로드
      const [studentRes, attendanceRes, paymentsRes] = await Promise.all([
        api.getStudent(studentId),
        api.getAttendance({
          student_id: studentId,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          limit: 30
        }),
        api.getPayments({ student_id: studentId })
      ])

      if (studentRes.success && studentRes.data) {
        setStudent(studentRes.data)
      } else {
        throw new Error(studentRes.error || '학생 정보를 불러올 수 없습니다.')
      }

      if (attendanceRes.success && attendanceRes.data) {
        setAttendanceHistory(Array.isArray(attendanceRes.data) ? attendanceRes.data : [])
      }

      if (paymentsRes.success && paymentsRes.data) {
        setPaymentHistory(Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/students/${studentId}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const response = await api.deleteStudent(studentId)
      if (response.success) {
        router.push('/students')
      } else {
        alert(response.error || '학생 삭제에 실패했습니다.')
      }
    } catch (err) {
      alert('학생 삭제에 실패했습니다.')
    }
  }

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '-'
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  const getStatusIcon = (student: Student) => {
    if (!student.is_active) {
      return <ClockIcon className="w-5 h-5 text-gray-500" />
    }

    if (student.active_payment) {
      const daysLeft = student.active_payment.days_until_expiry
      
      if (daysLeft <= 3) {
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      } else if (daysLeft <= 7) {
        return <ClockIcon className="w-5 h-5 text-orange-500" />
      }
    }

    return <CheckCircleIcon className="w-5 h-5 text-green-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || '학생을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push('/students')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            학생 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/students')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-600">학생 상세 정보</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            <span>수정</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            <span>삭제</span>
          </button>
        </div>
      </div>

      {/* 상태 카드 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(student)}
            <div>
              <h3 className="font-semibold text-gray-900">
                {student.is_active ? '활성 학생' : '비활성 학생'}
              </h3>
              <p className="text-sm text-gray-600">
                {student.active_payment 
                  ? `${student.active_payment.days_until_expiry}일 후 만료` 
                  : '활성 결제 없음'
                }
              </p>
            </div>
          </div>
          
          {student.attendance_rate !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {student.attendance_rate}%
              </div>
              <div className="text-sm text-gray-600">출석률</div>
            </div>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'info', label: '기본 정보', icon: AcademicCapIcon },
            { key: 'attendance', label: '출석 기록', icon: CalendarDaysIcon },
            { key: 'payments', label: '결제 이력', icon: CreditCardIcon }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* 기본 정보 탭 */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">연락처 정보</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">학생:</span>
                      <span className="text-sm">{formatPhoneNumber(student.phone)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">학부모:</span>
                      <span className="text-sm">{formatPhoneNumber(student.parent_phone)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">학업 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">학년:</span>
                      <span className="text-sm ml-2">{student.grade || '-'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">등록일:</span>
                      <span className="text-sm ml-2">
                        {new Date(student.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 수강 과목 */}
              {student.subjects && student.subjects.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">수강 과목</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 시간표 */}
              {student.schedule && Object.keys(student.schedule).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">수업 시간표</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(student.schedule).map(([day, time]) => (
                      time && (
                        <div key={day} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600">{weekDayNames[day]}</div>
                          <div className="text-sm font-medium">{time}</div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* 특이사항 */}
              {student.memo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">특이사항</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{student.memo}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 출석 기록 탭 */}
          {activeTab === 'attendance' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">최근 30일 출석 기록</h4>
                <span className="text-sm text-gray-600">
                  총 {attendanceHistory.length}회 기록
                </span>
              </div>
              
              {attendanceHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  출석 기록이 없습니다.
                </div>
              ) : (
                <div className="space-y-2">
                  {attendanceHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('ko-KR')}
                        </div>
                        {record.time_in && (
                          <div className="text-sm text-gray-600">
                            입실: {record.time_in}
                          </div>
                        )}
                        {record.note && (
                          <div className="text-sm text-gray-600 mt-1">
                            {record.note}
                          </div>
                        )}
                      </div>
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${statusColors[record.status]}
                      `}>
                        {statusLabels[record.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 결제 이력 탭 */}
          {activeTab === 'payments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">결제 이력</h4>
                <span className="text-sm text-gray-600">
                  총 {paymentHistory.length}건
                </span>
              </div>
              
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  결제 이력이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {payment.amount.toLocaleString()}원
                        </div>
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${payment.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                          }
                        `}>
                          {payment.is_active ? '활성' : '만료'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          기간: {new Date(payment.start_date).toLocaleDateString('ko-KR')} ~ {new Date(payment.end_date).toLocaleDateString('ko-KR')}
                        </div>
                        <div>
                          수업: {payment.sessions_used}/{payment.sessions_total}회 사용
                        </div>
                        <div>
                          등록일: {new Date(payment.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      
                      {/* 진행률 바 */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">수업 진행률</span>
                          <span className="font-medium">
                            {Math.round((payment.sessions_used / payment.sessions_total) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(payment.sessions_used / payment.sessions_total) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}