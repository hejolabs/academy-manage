'use client'

import { useRouter } from 'next/navigation'
import { 
  PhoneIcon, 
  AcademicCapIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Student {
  id: number
  name: string
  grade?: string
  phone?: string
  parent_phone?: string
  subjects?: string[]
  is_active: boolean
  created_at: string
  attendance_rate?: number
  active_payment?: {
    id: number
    end_date: string
    days_until_expiry: number
    progress_percentage: number
  }
}

interface StudentCardProps {
  student: Student
  onClick?: () => void
  className?: string
}

const getStatusColor = (student: Student) => {
  if (!student.is_active) {
    return {
      border: 'border-gray-300',
      bg: 'bg-gray-50',
      status: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-800'
    }
  }

  if (student.active_payment) {
    const daysLeft = student.active_payment.days_until_expiry
    
    if (daysLeft <= 3) {
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        status: 'text-red-600',
        badge: 'bg-red-100 text-red-800'
      }
    } else if (daysLeft <= 7) {
      return {
        border: 'border-orange-200',
        bg: 'bg-orange-50',
        status: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800'
      }
    }
  }

  return {
    border: 'border-green-200',
    bg: 'bg-green-50',
    status: 'text-green-600',
    badge: 'bg-green-100 text-green-800'
  }
}

const getStatusIcon = (student: Student) => {
  if (!student.is_active) {
    return <ClockIcon className="w-4 h-4" />
  }

  if (student.active_payment) {
    const daysLeft = student.active_payment.days_until_expiry
    
    if (daysLeft <= 3) {
      return <ExclamationTriangleIcon className="w-4 h-4" />
    } else if (daysLeft <= 7) {
      return <ClockIcon className="w-4 h-4" />
    }
  }

  return <CheckCircleIcon className="w-4 h-4" />
}

const getStatusText = (student: Student) => {
  if (!student.is_active) {
    return '비활성'
  }

  if (student.active_payment) {
    const daysLeft = student.active_payment.days_until_expiry
    
    if (daysLeft <= 0) {
      return '만료됨'
    } else if (daysLeft <= 3) {
      return `${daysLeft}일 남음`
    } else if (daysLeft <= 7) {
      return `${daysLeft}일 남음`
    }
  }

  return '활성'
}

export default function StudentCard({ student, onClick, className = '' }: StudentCardProps) {
  const router = useRouter()
  const colors = getStatusColor(student)

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/students/${student.id}`)
    }
  }

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return null
    // 간단한 전화번호 포맷 (010-1234-5678)
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-white rounded-xl p-4 shadow-sm border-2 cursor-pointer
        transition-all duration-200 hover:shadow-md active:scale-98
        ${colors.border} ${className}
      `}
    >
      {/* 헤더: 이름과 상태 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {student.name}
          </h3>
          {student.grade && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <AcademicCapIcon className="w-4 h-4" />
              <span>{student.grade}</span>
            </div>
          )}
        </div>
        
        <div className={`
          flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
          ${colors.badge}
        `}>
          {getStatusIcon(student)}
          <span>{getStatusText(student)}</span>
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="space-y-2 mb-4">
        {student.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4" />
            <span>{formatPhoneNumber(student.phone)}</span>
          </div>
        )}
        {student.parent_phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <PhoneIcon className="w-4 h-4" />
            <span>부모: {formatPhoneNumber(student.parent_phone)}</span>
          </div>
        )}
      </div>

      {/* 과목 태그 */}
      {student.subjects && student.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {student.subjects.slice(0, 3).map((subject, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {subject}
            </span>
          ))}
          {student.subjects.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{student.subjects.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 출석률 진행바 */}
      {student.attendance_rate !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">출석률</span>
            <span className="font-medium text-gray-900">
              {student.attendance_rate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                student.attendance_rate >= 80 
                  ? 'bg-green-500' 
                  : student.attendance_rate >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`}
              style={{ width: `${student.attendance_rate}%` }}
            />
          </div>
        </div>
      )}

      {/* 결제 정보 */}
      {student.active_payment && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">수업 진행률</span>
            <span className="font-medium text-gray-900">
              {student.active_payment.progress_percentage}%
            </span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${student.active_payment.progress_percentage}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            만료일: {new Date(student.active_payment.end_date).toLocaleDateString('ko-KR')}
          </div>
        </div>
      )}

      {/* 비활성 학생 표시 */}
      {!student.is_active && (
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center">
            비활성 상태 - 수업 진행 없음
          </div>
        </div>
      )}
    </div>
  )
}

// 로딩 스켈레톤
export function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>

      <div className="flex space-x-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>

      <div className="mb-3">
        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
        <div className="h-2 bg-gray-200 rounded-full w-full"></div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-2 bg-gray-200 rounded-full w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-20 mt-2"></div>
      </div>
    </div>
  )
}