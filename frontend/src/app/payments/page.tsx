'use client'

import { useState, useEffect, useCallback } from 'react'
import { CreditCardIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import ExpiringPayments from '@/components/payments/ExpiringPayments'
import PaymentCard from '@/components/payments/PaymentCard'
import PaymentStats from '@/components/payments/PaymentStats'
import SessionCompleteModal from '@/components/payments/SessionCompleteModal'
import PaymentForm from '@/components/payments/PaymentForm'
import { PaymentDetail, PaymentStats as PaymentStatsType } from '@/lib/types'
import { api } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type FilterType = 'all' | 'active' | 'expiring' | 'completed'

export default function PaymentsPage() {
  // State
  const [payments, setPayments] = useState<PaymentDetail[]>([])
  const [expiringPayments, setExpiringPayments] = useState<PaymentDetail[]>([])
  const [stats, setStats] = useState<PaymentStatsType | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false)
  const [selectedPaymentForSession, setSelectedPaymentForSession] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 데이터 로드
  const loadPaymentsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('결제 데이터 로드 시작...')

      // API 호출들을 병렬로 실행
      const [paymentsRes, expiringRes, statsRes] = await Promise.all([
        api.getPayments({ is_active: true, limit: 100 }),
        api.getExpiringPayments(30), // 30일 이내 만료 예정
        api.getPaymentStats()
      ])

      console.log('API 응답들:', { paymentsRes, expiringRes, statsRes })

      // 결제 목록 설정
      if (paymentsRes.success && paymentsRes.data) {
        const paymentsList = Array.isArray(paymentsRes.data) ? paymentsRes.data : []
        setPayments(paymentsList)
      } else {
        console.warn('결제 목록 로드 실패:', paymentsRes.error)
        setPayments([])
      }

      // 만료 예정 결제 설정
      if (expiringRes.success && expiringRes.data) {
        const expiringList = Array.isArray(expiringRes.data) ? expiringRes.data : []
        setExpiringPayments(expiringList)
      } else {
        console.warn('만료 예정 결제 로드 실패:', expiringRes.error)
        setExpiringPayments([])
      }

      // 통계 설정
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      } else {
        console.warn('통계 로드 실패:', statsRes.error)
        // 기본 통계 설정
        setStats({
          monthly_revenue: 0,
          active_payments: payments.length,
          average_attendance_rate: 85,
          goal_achievement_rate: 75,
          total_students: 0,
          completed_sessions_this_month: 0
        })
      }

    } catch (err) {
      console.error('결제 데이터 로드 실패:', err)
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPaymentsData()
  }, [loadPaymentsData])

  // 필터된 결제 목록
  const filteredPayments = payments.filter(payment => {
    switch (selectedFilter) {
      case 'active':
        return payment.is_active
      case 'expiring':
        const daysLeft = Math.ceil((new Date(payment.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return daysLeft <= 7 && daysLeft >= 0
      case 'completed':
        return payment.sessions_used >= payment.sessions_total
      default:
        return true
    }
  })

  // 수업 완료 처리
  const handleCompleteSession = async (paymentId: number) => {
    setSelectedPaymentForSession(paymentId)
  }

  // 수업 완료 모달에서 실제 완료 처리
  const handleSessionComplete = async (paymentId: number, date: string, notes?: string) => {
    try {
      const response = await api.completeSession(paymentId, { date, notes })
      
      if (response.success) {
        // 로컬 상태 업데이트
        setPayments(prev => prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, sessions_used: payment.sessions_used + 1 }
            : payment
        ))
        
        setSelectedPaymentForSession(null)
        // 통계 다시 로드
        loadPaymentsData()
      } else {
        alert('수업 완료 처리에 실패했습니다.')
      }
    } catch (err) {
      console.error('수업 완료 처리 실패:', err)
      alert('수업 완료 처리에 실패했습니다.')
    }
  }

  // 결제 연장 처리
  const handleExtendPayment = (_paymentId: number) => {
    // TODO: 결제 연장 모달 구현
    alert('결제 연장 기능은 곧 추가될 예정입니다.')
  }

  // 결제 수정 처리
  const handleEditPayment = (_paymentId: number) => {
    // TODO: 결제 수정 모달 구현
    alert('결제 수정 기능은 곧 추가될 예정입니다.')
  }

  // 새 결제 등록 완료
  const handlePaymentCreated = () => {
    setShowNewPaymentForm(false)
    loadPaymentsData()
  }

  // 만료 예정 결제 클릭
  const handleExpiringPaymentClick = (paymentId: number) => {
    // 해당 결제로 스크롤 또는 하이라이트
    const element = document.getElementById(`payment-${paymentId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.classList.add('ring-2', 'ring-blue-500')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500')
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">결제 관리</h1>
          <p className="text-gray-600 mt-1">8회차 진행도 및 결제 현황 관리</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewPaymentForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>새 결제</span>
          </button>
          <CreditCardIcon className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button
              onClick={loadPaymentsData}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 통계 섹션 */}
      {stats && (
        <PaymentStats stats={stats} loading={loading} />
      )}

      {/* 만료 예정 알림 섹션 */}
      {expiringPayments.length > 0 && (
        <ExpiringPayments 
          payments={expiringPayments}
          onPaymentClick={handleExpiringPaymentClick}
        />
      )}

      {/* 필터 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">활성 결제 목록</h3>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">필터</span>
          </div>
        </div>

        {/* 필터 버튼들 */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: '전체', count: payments.length },
            { key: 'active', label: '진행중', count: payments.filter(p => p.is_active).length },
            { key: 'expiring', label: '만료 임박', count: expiringPayments.length },
            { key: 'completed', label: '완료', count: payments.filter(p => p.sessions_used >= p.sessions_total).length }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as FilterType)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${selectedFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span>{filter.label}</span>
              <span className={`
                px-2 py-1 rounded-full text-xs
                ${selectedFilter === filter.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* 결제 카드 목록 */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {selectedFilter === 'all' ? '등록된 결제가 없습니다' : `${selectedFilter} 결제가 없습니다`}
            </h3>
            <p className="text-gray-600 mb-4">새로운 결제를 등록해보세요.</p>
            <button
              onClick={() => setShowNewPaymentForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              결제 등록
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPayments.map(payment => (
              <div key={payment.id} id={`payment-${payment.id}`}>
                <PaymentCard
                  payment={payment}
                  onCompleteSession={handleCompleteSession}
                  onExtend={handleExtendPayment}
                  onEdit={handleEditPayment}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 새 결제 등록 모달 */}
      {showNewPaymentForm && (
        <PaymentForm
          onClose={() => setShowNewPaymentForm(false)}
          onSuccess={handlePaymentCreated}
        />
      )}

      {/* 수업 완료 모달 */}
      {selectedPaymentForSession && (
        <SessionCompleteModal
          paymentId={selectedPaymentForSession}
          payment={payments.find(p => p.id === selectedPaymentForSession)}
          onClose={() => setSelectedPaymentForSession(null)}
          onComplete={handleSessionComplete}
        />
      )}
    </div>
  )
}