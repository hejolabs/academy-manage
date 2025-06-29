'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, CalendarDaysIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline'
import { PaymentFormData } from '@/lib/types'
import { api } from '@/lib/api'

interface PaymentFormProps {
  onClose: () => void
  onSuccess: () => void
}

interface Student {
  id: number
  name: string
  grade?: string
}

export default function PaymentForm({ onClose, onSuccess }: PaymentFormProps) {
  // State
  const [students, setStudents] = useState<Student[]>([])
  const [formData, setFormData] = useState<PaymentFormData>({
    student_id: 0,
    amount: 200000,
    payment_method: 'cash',
    start_date: new Date().toISOString().split('T')[0],
    sessions_total: 8,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // 학생 목록 로드
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setStudentsLoading(true)
      const response = await api.getStudents({ is_active: true })
      
      if (response.success && response.data) {
        const studentsList = response.data.students || []
        setStudents(studentsList)
      }
    } catch (err) {
      console.error('학생 목록 로드 실패:', err)
    } finally {
      setStudentsLoading(false)
    }
  }

  // 8회차 완료 예정일 계산
  const calculateCompletionDate = () => {
    const startDate = new Date(formData.start_date)
    const sessionsPerWeek = 3 // 월/수/금
    const weeks = Math.ceil(formData.sessions_total! / sessionsPerWeek)
    const completionDate = new Date(startDate)
    completionDate.setDate(completionDate.getDate() + (weeks * 7))
    
    return completionDate.toLocaleDateString('ko-KR')
  }

  // 폼 검증
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.student_id || formData.student_id === 0) {
      newErrors.student_id = '학생을 선택해주세요'
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '올바른 금액을 입력해주세요'
    }
    
    if (!formData.start_date) {
      newErrors.start_date = '시작일을 선택해주세요'
    }
    
    if (!formData.sessions_total || formData.sessions_total <= 0) {
      newErrors.sessions_total = '수업 횟수를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      const response = await api.createPayment(formData)
      
      if (response.success) {
        onSuccess()
      } else {
        setErrors({ general: response.error || '결제 등록에 실패했습니다' })
      }
    } catch (err) {
      setErrors({ general: '결제 등록에 실패했습니다' })
    } finally {
      setLoading(false)
    }
  }

  // 입력값 변경 처리
  const handleChange = (field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* 모달 */}
      <div className="fixed inset-x-4 top-10 bottom-10 bg-white rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">새 결제 등록</h2>
              <p className="text-sm text-gray-600">학생의 8회차 결제를 등록합니다</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 폼 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 일반 에러 메시지 */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* 학생 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                학생 선택 *
              </label>
              {studentsLoading ? (
                <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : (
                <select
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.student_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>학생을 선택하세요</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.grade && `(${student.grade})`}
                    </option>
                  ))}
                </select>
              )}
              {errors.student_id && (
                <p className="text-red-600 text-sm mt-1">{errors.student_id}</p>
              )}
            </div>

            {/* 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제 금액 *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="200000"
                  step="10000"
                />
                <span className="absolute right-3 top-3 text-gray-500">원</span>
              </div>
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            {/* 결제 방법 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제 방법 *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'cash', label: '현금', icon: '💵' },
                  { value: 'card', label: '카드', icon: '💳' },
                  { value: 'transfer', label: '계좌이체', icon: '🏦' }
                ].map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleChange('payment_method', method.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      formData.payment_method === method.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className="text-sm font-medium">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 시작일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  시작일 *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.start_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && (
                  <p className="text-red-600 text-sm mt-1">{errors.start_date}</p>
                )}
              </div>

              {/* 수업 횟수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  총 수업 횟수 *
                </label>
                <input
                  type="number"
                  value={formData.sessions_total}
                  onChange={(e) => handleChange('sessions_total', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sessions_total ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="1"
                  max="20"
                />
                {errors.sessions_total && (
                  <p className="text-red-600 text-sm mt-1">{errors.sessions_total}</p>
                )}
              </div>
            </div>

            {/* 예상 완료일 표시 */}
            {formData.start_date && formData.sessions_total && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    예상 완료일: {calculateCompletionDate()}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  주 3회 수업(월/수/금) 기준으로 계산됩니다
                </p>
              </div>
            )}

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택사항)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="추가 메모사항을 입력하세요..."
              />
            </div>
          </form>
        </div>

        {/* 액션 버튼 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '등록 중...' : '결제 등록'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}