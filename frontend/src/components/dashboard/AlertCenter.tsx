'use client'

import { useState, useEffect } from 'react'
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CreditCardIcon,
  UserIcon,
  BellAlertIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { InlineLoader } from '@/components/ui/LoadingSpinner'

interface Alert {
  id: string
  type: 'payment_expiring' | 'payment_expired' | 'absent_streak' | 'schedule_reminder' | 'low_attendance'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  studentName?: string
  studentId?: number
  daysLeft?: number
  actionRequired: boolean
  createdAt: Date
}

// 목업 데이터
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'payment_expiring',
    title: '결제 만료 임박',
    message: '김민수 학생의 수강료가 3일 후 만료됩니다.',
    severity: 'high',
    studentName: '김민수',
    studentId: 1,
    daysLeft: 3,
    actionRequired: true,
    createdAt: new Date()
  },
  {
    id: '2',
    type: 'absent_streak',
    title: '장기 결석',
    message: '이영희 학생이 5일째 결석 중입니다.',
    severity: 'critical',
    studentName: '이영희',
    studentId: 2,
    actionRequired: true,
    createdAt: new Date()
  },
  {
    id: '3',
    type: 'payment_expiring',
    message: '박철수 학생의 수강료가 7일 후 만료됩니다.',
    title: '결제 만료 예정',
    severity: 'medium',
    studentName: '박철수',
    studentId: 3,
    daysLeft: 7,
    actionRequired: false,
    createdAt: new Date()
  },
  {
    id: '4',
    type: 'schedule_reminder',
    title: '수업 시간 임박',
    message: '15분 후 중학 수학 수업이 시작됩니다.',
    severity: 'medium',
    actionRequired: false,
    createdAt: new Date()
  },
  {
    id: '5',
    type: 'low_attendance',
    title: '출석률 저조',
    message: '정수빈 학생의 출석률이 60%로 저조합니다.',
    severity: 'medium',
    studentName: '정수빈',
    studentId: 4,
    actionRequired: true,
    createdAt: new Date()
  }
]

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'payment_expiring':
    case 'payment_expired':
      return CreditCardIcon
    case 'absent_streak':
    case 'low_attendance':
      return UserIcon
    case 'schedule_reminder':
      return ClockIcon
    default:
      return BellAlertIcon
  }
}

const getSeverityColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical':
      return 'border-red-200 bg-red-50'
    case 'high':
      return 'border-orange-200 bg-orange-50'
    case 'medium':
      return 'border-yellow-200 bg-yellow-50'
    case 'low':
      return 'border-blue-200 bg-blue-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

const getSeverityIconColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600'
    case 'high':
      return 'text-orange-600'
    case 'medium':
      return 'text-yellow-600'
    case 'low':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

const getSeverityTextColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical':
      return 'text-red-800'
    case 'high':
      return 'text-orange-800'
    case 'medium':
      return 'text-yellow-800'
    case 'low':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}

export default function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'action_required'>('all')

  useEffect(() => {
    // 실제로는 API 호출
    const fetchAlerts = async () => {
      try {
        // TODO: API 호출로 교체
        // const response = await fetch('/api/alerts')
        // const data = await response.json()
        
        setTimeout(() => {
          setAlerts(mockAlerts)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  const handleAlertClick = (alert: Alert) => {
    if (alert.studentId) {
      // TODO: 학생 상세 페이지로 이동
      console.log(`Navigate to student ${alert.studentId}`)
    } else if (alert.type === 'schedule_reminder') {
      // TODO: 캘린더 페이지로 이동
      console.log('Navigate to calendar')
    }
  }

  const filteredAlerts = filter === 'action_required' 
    ? alerts.filter(alert => alert.actionRequired)
    : alerts

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
  const actionRequiredCount = alerts.filter(alert => alert.actionRequired).length

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <InlineLoader text="알림을 불러오는 중..." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 알림 요약 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BellAlertIcon className="w-5 h-5" />
            <span>알림 센터</span>
          </h3>
          
          {alerts.length > 0 && (
            <div className="flex items-center space-x-2">
              {criticalAlerts.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  긴급 {criticalAlerts.length}건
                </span>
              )}
              {actionRequiredCount > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  조치 필요 {actionRequiredCount}건
                </span>
              )}
            </div>
          )}
        </div>

        {/* 필터 */}
        {alerts.length > 0 && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체 ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('action_required')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'action_required'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              조치 필요 ({actionRequiredCount})
            </button>
          </div>
        )}

        {/* 알림 목록 */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <BellAlertIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'action_required' ? '조치가 필요한 알림이 없습니다.' : '새로운 알림이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type)
              
              return (
                <div
                  key={alert.id}
                  className={`
                    border rounded-lg p-3 transition-all duration-200
                    ${getSeverityColor(alert.severity)}
                    ${alert.studentId ? 'cursor-pointer hover:shadow-md' : ''}
                  `}
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-1 rounded ${getSeverityIconColor(alert.severity)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium text-sm ${getSeverityTextColor(alert.severity)}`}>
                            {alert.title}
                          </h4>
                          {alert.actionRequired && (
                            <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded">
                              조치 필요
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-tight">
                          {alert.message}
                        </p>
                        
                        {alert.daysLeft !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.daysLeft}일 남음
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDismissAlert(alert.id)
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      aria-label="알림 닫기"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// 로딩 스켈레톤
export function AlertCenterSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-20 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}