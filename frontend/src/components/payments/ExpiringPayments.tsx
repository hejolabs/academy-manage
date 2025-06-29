'use client'

import { ExclamationTriangleIcon, ClockIcon, BellIcon } from '@heroicons/react/24/outline'
import { PaymentDetail } from '@/lib/types'

interface ExpiringPaymentsProps {
  payments: PaymentDetail[]
  onPaymentClick?: (paymentId: number) => void
}

interface PaymentGroup {
  title: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ComponentType<{ className?: string }>
  payments: PaymentDetail[]
}

export default function ExpiringPayments({ payments, onPaymentClick }: ExpiringPaymentsProps) {
  // 만료까지 남은 일수 계산
  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // 긴급도별로 그룹화
  const groupPaymentsByUrgency = (): PaymentGroup[] => {
    const groups: PaymentGroup[] = [
      {
        title: 'D-1 (내일 만료)',
        color: 'text-red-800',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: ExclamationTriangleIcon,
        payments: []
      },
      {
        title: 'D-3 (3일 이내)',
        color: 'text-orange-800',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: ClockIcon,
        payments: []
      },
      {
        title: 'D-7 (일주일 이내)',
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: BellIcon,
        payments: []
      }
    ]

    payments.forEach(payment => {
      const daysLeft = getDaysUntilExpiry(payment.end_date)
      
      if (daysLeft <= 1) {
        groups[0].payments.push(payment)
      } else if (daysLeft <= 3) {
        groups[1].payments.push(payment)
      } else if (daysLeft <= 7) {
        groups[2].payments.push(payment)
      }
    })

    return groups.filter(group => group.payments.length > 0)
  }

  const paymentGroups = groupPaymentsByUrgency()

  // 총 만료 예정 건수
  const totalExpiringCount = payments.length

  if (totalExpiringCount === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            만료 예정인 결제가 없습니다
          </h3>
          <p className="text-gray-600">
            모든 결제가 안정적으로 관리되고 있습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              만료 예정 알림
            </h3>
          </div>
          <div className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
            {totalExpiringCount}건
          </div>
        </div>
      </div>

      {/* 그룹별 만료 예정 목록 */}
      <div className="p-4 space-y-4">
        {paymentGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={`rounded-lg border-2 ${group.borderColor} ${group.bgColor}`}>
            {/* 그룹 헤더 */}
            <div className="px-4 py-3 border-b border-current border-opacity-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <group.icon className={`w-4 h-4 ${group.color}`} />
                  <h4 className={`font-medium ${group.color}`}>
                    {group.title}
                  </h4>
                </div>
                <span className={`text-sm font-medium ${group.color}`}>
                  {group.payments.length}명
                </span>
              </div>
            </div>

            {/* 그룹 내 결제 목록 */}
            <div className="p-3 space-y-2">
              {group.payments.map((payment) => {
                const daysLeft = getDaysUntilExpiry(payment.end_date)
                const remainingSessions = Math.max(0, payment.sessions_total - payment.sessions_used)
                
                return (
                  <div
                    key={payment.id}
                    onClick={() => onPaymentClick?.(payment.id)}
                    className={`
                      p-3 bg-white rounded-lg border transition-all duration-200 cursor-pointer
                      hover:shadow-md hover:border-gray-300
                      ${group.borderColor}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-900">
                            {payment.student_name}
                          </h5>
                          {payment.student_grade && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {payment.student_grade}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            만료: {new Date(payment.end_date).toLocaleDateString('ko-KR')}
                          </span>
                          <span>•</span>
                          <span>
                            잔여 수업: {remainingSessions}회
                          </span>
                          <span>•</span>
                          <span>
                            {payment.amount.toLocaleString()}원
                          </span>
                        </div>

                        {/* 진행도 미니 바 */}
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(payment.sessions_used / payment.sessions_total) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {payment.sessions_used}/{payment.sessions_total}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 긴급도 표시 */}
                      <div className="flex flex-col items-end space-y-1">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${daysLeft <= 0 
                            ? 'bg-red-100 text-red-800' 
                            : daysLeft === 1 
                            ? 'bg-red-100 text-red-800'
                            : daysLeft <= 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        `}>
                          {daysLeft <= 0 ? '만료' : `D-${daysLeft}`}
                        </div>
                        
                        {remainingSessions > 0 && (
                          <div className="text-xs text-gray-500">
                            {remainingSessions}회 남음
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex space-x-3">
          <button className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            일괄 연장 처리
          </button>
          <button className="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
            알림 설정
          </button>
        </div>
      </div>
    </div>
  )
}

// 로딩 스켈레톤
export function ExpiringPaymentsSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-6 bg-gray-200 rounded-full w-12"></div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border-2 border-gray-200 bg-gray-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="p-3 space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}