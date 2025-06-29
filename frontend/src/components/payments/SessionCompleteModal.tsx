'use client'

import { useState } from 'react'
import { XMarkIcon, CheckCircleIcon, CalendarDaysIcon, SparklesIcon } from '@heroicons/react/24/outline'
import SessionProgressBar from './SessionProgressBar'
import { PaymentDetail } from '@/lib/types'

interface SessionCompleteModalProps {
  paymentId: number
  payment?: PaymentDetail
  onClose: () => void
  onComplete: (paymentId: number, date: string, notes?: string) => void
}

export default function SessionCompleteModal({ 
  paymentId, 
  payment, 
  onClose, 
  onComplete 
}: SessionCompleteModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  if (!payment) {
    return null
  }

  const isLastSession = payment.sessions_used + 1 >= payment.sessions_total
  const nextSessionNumber = payment.sessions_used + 1

  const handleComplete = async () => {
    try {
      setLoading(true)
      await onComplete(paymentId, selectedDate, notes)
    } catch (err) {
      console.error('수업 완료 처리 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* 모달 */}
      <div className="fixed inset-x-4 top-20 bottom-20 bg-white rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-w-lg mx-auto">
        {/* 헤더 */}
        <div className={`p-6 border-b border-gray-200 ${
          isLastSession ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isLastSession ? (
                <SparklesIcon className="w-6 h-6 text-green-600" />
              ) : (
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isLastSession ? '🎉 마지막 수업 완료!' : '수업 완료 처리'}
                </h2>
                <p className="text-sm text-gray-600">
                  {payment.student_name}의 {nextSessionNumber}회차 수업
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 현재 진행도 표시 */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">현재 진행도</h3>
            <SessionProgressBar
              totalSessions={payment.sessions_total}
              completedSessions={payment.sessions_used}
              size="md"
              showNumbers={true}
              showPercentage={true}
            />
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 완료 후 진행도 미리보기 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">
              완료 후 진행도 ({nextSessionNumber}회차)
            </h3>
            <SessionProgressBar
              totalSessions={payment.sessions_total}
              completedSessions={payment.sessions_used + 1}
              size="md"
              showNumbers={true}
              showPercentage={true}
              animated={true}
            />
          </div>

          {/* 수업 날짜 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
              수업 날짜 *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              오늘 이전 날짜만 선택할 수 있습니다
            </p>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 메모 (선택사항)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="오늘 수업 내용이나 특이사항을 기록하세요..."
            />
          </div>

          {/* 마지막 수업일 때 축하 메시지 */}
          {isLastSession && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <SparklesIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🎉 축하합니다!
                </h3>
                <p className="text-green-800 text-sm">
                  {payment.student_name} 학생이 8회차 수업을 모두 완료합니다!
                </p>
                <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                  <p className="text-xs text-green-700">
                    수업 완료 후 결제 상태가 '완료'로 변경됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 결제 정보 요약 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">결제 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">학생:</span>
                <div className="font-medium">{payment.student_name}</div>
              </div>
              <div>
                <span className="text-gray-600">결제 금액:</span>
                <div className="font-medium">{payment.amount.toLocaleString()}원</div>
              </div>
              <div>
                <span className="text-gray-600">시작일:</span>
                <div className="font-medium">
                  {new Date(payment.start_date).toLocaleDateString('ko-KR')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">만료 예정:</span>
                <div className="font-medium">
                  {new Date(payment.end_date).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
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
              onClick={handleComplete}
              disabled={loading || !selectedDate}
              className={`
                flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors
                ${isLastSession 
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading ? '처리 중...' : 
               isLastSession ? '🎉 완료 처리' : '수업 완료'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}