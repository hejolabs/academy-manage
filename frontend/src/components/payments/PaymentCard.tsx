'use client'

import { useState } from 'react'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PencilIcon, 
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import SessionProgressBar from './SessionProgressBar'
import { PaymentDetail } from '@/lib/types'

interface PaymentCardProps {
  payment: PaymentDetail
  onCompleteSession: (paymentId: number) => void
  onExtend: (paymentId: number) => void
  onEdit: (paymentId: number) => void
}

export default function PaymentCard({ payment, onCompleteSession, onExtend, onEdit }: PaymentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 만료까지 남은 일수 계산
  const getDaysUntilExpiry = () => {
    const endDate = new Date(payment.end_date)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysLeft = getDaysUntilExpiry()
  const isExpiringSoon = daysLeft <= 7
  const isExpired = daysLeft < 0

  // 결제 방법 아이콘
  const getPaymentMethodIcon = () => {
    switch (payment.payment_method) {
      case 'card':
        return <CreditCardIcon className="w-4 h-4" />
      case 'cash':
        return <BanknotesIcon className="w-4 h-4" />
      case 'transfer':
        return <BuildingLibraryIcon className="w-4 h-4" />
      default:
        return <CreditCardIcon className="w-4 h-4" />
    }
  }

  // 결제 방법 라벨
  const getPaymentMethodLabel = () => {
    switch (payment.payment_method) {
      case 'card':
        return '카드'
      case 'cash':
        return '현금'
      case 'transfer':
        return '계좌이체'
      default:
        return '기타'
    }
  }

  // 카드 배경 색상 (만료 상태에 따라)
  const getCardStyles = () => {
    if (isExpired) {
      return 'border-red-200 bg-red-50'
    }
    if (isExpiringSoon) {
      return 'border-orange-200 bg-orange-50'
    }
    if (payment.sessions_used >= payment.sessions_total) {
      return 'border-green-200 bg-green-50'
    }
    return 'border-gray-200 bg-white'
  }

  // 상태 배지
  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <ExclamationTriangleIcon className="w-3 h-3" />
          <span>만료</span>
        </div>
      )
    }
    
    if (payment.sessions_used >= payment.sessions_total) {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircleIcon className="w-3 h-3" />
          <span>완료</span>
        </div>
      )
    }
    
    if (isExpiringSoon) {
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
          <ClockIcon className="w-3 h-3" />
          <span>D-{daysLeft}</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        <ClockIcon className="w-3 h-3" />
        <span>진행중</span>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border-2 transition-all duration-200 ${getCardStyles()}`}>
      {/* 카드 헤더 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {payment.student_name}
              </h3>
              {payment.student_grade && (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {payment.student_grade}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {getPaymentMethodIcon()}
              <span>{getPaymentMethodLabel()}</span>
              <span>•</span>
              <span>{payment.amount.toLocaleString()}원</span>
            </div>
          </div>
          
          {getStatusBadge()}
        </div>

        {/* 8회차 진행도 */}
        <div className="mb-4">
          <SessionProgressBar
            totalSessions={payment.sessions_total}
            completedSessions={payment.sessions_used}
            size="md"
            showNumbers={true}
            showPercentage={false}
          />
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600">시작일:</span>
            <div className="font-medium">{formatDate(payment.start_date)}</div>
          </div>
          <div>
            <span className="text-gray-600">만료 예정:</span>
            <div className={`font-medium ${
              isExpired ? 'text-red-600' : 
              isExpiringSoon ? 'text-orange-600' : 
              'text-gray-900'
            }`}>
              {formatDate(payment.end_date)}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex space-x-2">
          <button
            onClick={() => onCompleteSession(payment.id)}
            disabled={payment.sessions_used >= payment.sessions_total}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors
              ${payment.sessions_used >= payment.sessions_total
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            `}
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>수업 완료</span>
          </button>
          
          <button
            onClick={() => onExtend(payment.id)}
            className="flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>연장</span>
          </button>
          
          <button
            onClick={() => onEdit(payment.id)}
            className="flex items-center justify-center space-x-2 py-2 px-3 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            <span>수정</span>
          </button>
        </div>

        {/* 확장 가능한 상세 정보 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div>
              <span className="text-sm text-gray-600">등록일:</span>
              <div className="text-sm font-medium">{formatDate(payment.created_at)}</div>
            </div>
            
            {payment.notes && (
              <div>
                <span className="text-sm text-gray-600">메모:</span>
                <div className="text-sm text-gray-800 mt-1 p-2 bg-gray-50 rounded">
                  {payment.notes}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">완료율:</span>
                <div className="font-medium">
                  {Math.round((payment.sessions_used / payment.sessions_total) * 100)}%
                </div>
              </div>
              <div>
                <span className="text-gray-600">남은 수업:</span>
                <div className="font-medium">
                  {Math.max(0, payment.sessions_total - payment.sessions_used)}회
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 상세 정보 토글 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? '접기' : '상세 정보 보기'} {isExpanded ? '▲' : '▼'}
        </button>
      </div>
    </div>
  )
}

// 로딩 스켈레톤
export function PaymentCardSkeleton() {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white animate-pulse">
      <div className="p-4 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="flex space-x-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-8 h-3 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}