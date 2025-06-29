'use client'

import { XMarkIcon, CalendarDaysIcon, UserGroupIcon, CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { CalendarDayData, SessionProgress } from '@/lib/types'

interface DayDetailModalProps {
  date: string
  dayData?: CalendarDayData
  sessionProgress: SessionProgress[]
  onClose: () => void
}

export default function DayDetailModal({ date, dayData, sessionProgress, onClose }: DayDetailModalProps) {
  if (!dayData) return null

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  // 이벤트를 타입별로 그룹화
  const sessionCompleteEvents = dayData.events.filter(e => e.type === 'session_complete')
  const paymentExpireEvents = dayData.events.filter(e => e.type === 'payment_expire')
  const classEvents = dayData.events.filter(e => e.type === 'class_day')
  const holidayEvents = dayData.events.filter(e => e.type === 'holiday')

  // 해당 날짜의 8회차 완료 예정 학생들의 상세 정보
  const getSessionDetails = (studentId: number) => {
    return sessionProgress.find(p => p.studentId === studentId)
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="fixed inset-x-4 top-20 bottom-20 bg-white rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDate(date)}
              </h2>
              <p className="text-sm text-gray-600">
                일정 상세 정보
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

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 8회차 완료 예정 */}
          {sessionCompleteEvents.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">8회차 완료 예정</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {sessionCompleteEvents.length}명
                </span>
              </div>
              
              <div className="space-y-3">
                {sessionCompleteEvents.map((event) => {
                  const details = event.studentId ? getSessionDetails(event.studentId) : null
                  
                  return (
                    <div key={event.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-900">
                          {event.studentName}
                        </h4>
                        <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                          8회차 완료
                        </span>
                      </div>
                      
                      {details && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-green-700 font-medium">진행률:</span>
                            <div className="mt-1">
                              <div className="text-green-800">
                                {details.completedSessions}/{details.totalSessions}회 완료
                              </div>
                              <div className="w-full bg-green-100 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${(details.completedSessions / details.totalSessions) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-green-700 font-medium">결제 만료:</span>
                            <div className="text-green-800 mt-1">
                              {details.paymentEndDate 
                                ? new Date(details.paymentEndDate).toLocaleDateString('ko-KR')
                                : '정보 없음'
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 결제 만료 예정 */}
          {paymentExpireEvents.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">결제 만료 예정</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {paymentExpireEvents.length}명
                </span>
              </div>
              
              <div className="space-y-3">
                {paymentExpireEvents.map((event) => {
                  const details = event.studentId ? getSessionDetails(event.studentId) : null
                  
                  return (
                    <div key={event.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-red-900">
                          {event.studentName}
                        </h4>
                        <span className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded">
                          결제 만료
                        </span>
                      </div>
                      
                      {details && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-red-700 font-medium">수업 진행:</span>
                            <div className="text-red-800 mt-1">
                              {details.completedSessions}/{details.totalSessions}회 완료
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-red-700 font-medium">예상 완료일:</span>
                            <div className="text-red-800 mt-1">
                              {new Date(details.estimatedCompletionDate).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 정규 수업일 */}
          {classEvents.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">정규 수업</h3>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800">
                  정규 수업일입니다. 모든 학생들의 출석을 확인해주세요.
                </div>
                <div className="mt-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    → 출석 관리 페이지로 이동
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 휴무일 */}
          {holidayEvents.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CalendarDaysIcon className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">휴무일</h3>
              </div>
              
              <div className="space-y-2">
                {holidayEvents.map((event) => (
                  <div key={event.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-orange-700 mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 일정이 없는 경우 */}
          {dayData.events.length === 0 && (
            <div className="text-center py-8">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">일정이 없습니다</h3>
              <p className="text-gray-600">이 날짜에는 특별한 일정이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
            <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              출석 관리
            </button>
          </div>
        </div>
      </div>
    </>
  )
}