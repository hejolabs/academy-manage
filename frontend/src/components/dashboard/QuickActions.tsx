'use client'

import { useRouter } from 'next/navigation'
import { 
  CheckCircleIcon, 
  UserPlusIcon, 
  CreditCardIcon, 
  CalendarDaysIcon,
  QrCodeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

interface QuickAction {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  color: string
  size: 'large' | 'normal'
  badge?: string | number
}

export default function QuickActions() {
  const router = useRouter()

  const handleQuickAttendance = () => {
    // TODO: 빠른 출석 체크 모달 또는 페이지 이동
    router.push('/attendance')
  }

  const handleAddStudent = () => {
    // TODO: 새 학생 등록 모달 또는 페이지 이동
    router.push('/students?action=new')
  }

  const handleAddPayment = () => {
    // TODO: 결제 등록 모달 또는 페이지 이동
    router.push('/payments?action=new')
  }

  const handleViewCalendar = () => {
    router.push('/calendar')
  }

  const handleQRAttendance = () => {
    // TODO: QR 코드 출석 체크 기능
    console.log('QR 출석 체크')
  }

  const handleTodayReport = () => {
    // TODO: 오늘의 보고서 생성/보기
    console.log('오늘의 보고서')
  }

  const quickActions: QuickAction[] = [
    {
      id: 'attendance',
      title: '출석 체크',
      subtitle: '학생들의 출석을 확인하세요',
      icon: CheckCircleIcon,
      onClick: handleQuickAttendance,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      size: 'large'
    },
    {
      id: 'add-student',
      title: '학생 등록',
      subtitle: '새로운 학생을 등록하세요',
      icon: UserPlusIcon,
      onClick: handleAddStudent,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      size: 'normal'
    },
    {
      id: 'add-payment',
      title: '결제 등록',
      subtitle: '수강료 결제를 등록하세요',
      icon: CreditCardIcon,
      onClick: handleAddPayment,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      size: 'normal'
    },
    {
      id: 'calendar',
      title: '캘린더',
      subtitle: '오늘의 일정을 확인하세요',
      icon: CalendarDaysIcon,
      onClick: handleViewCalendar,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      size: 'normal'
    },
    {
      id: 'qr-attendance',
      title: 'QR 출석',
      subtitle: 'QR 코드로 빠른 출석',
      icon: QrCodeIcon,
      onClick: handleQRAttendance,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      size: 'normal'
    },
    {
      id: 'today-report',
      title: '일일 보고서',
      subtitle: '오늘의 현황 요약',
      icon: ClipboardDocumentListIcon,
      onClick: handleTodayReport,
      color: 'bg-gradient-to-br from-gray-500 to-gray-600',
      size: 'normal'
    }
  ]

  const largeActions = quickActions.filter(action => action.size === 'large')
  const normalActions = quickActions.filter(action => action.size === 'normal')

  return (
    <div className="space-y-4">
      {/* 큰 액션 버튼 (출석 체크) */}
      {largeActions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={`
            w-full ${action.color} text-white rounded-xl p-6 shadow-lg
            transform transition-all duration-200 hover:scale-105 active:scale-95
            hover:shadow-xl
          `}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <action.icon className="w-8 h-8" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold">{action.title}</h3>
              <p className="text-white text-opacity-90 text-sm mt-1">
                {action.subtitle}
              </p>
            </div>
            {action.badge && (
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold">{action.badge}</span>
              </div>
            )}
          </div>
        </button>
      ))}

      {/* 일반 액션 버튼들 */}
      <div className="grid grid-cols-2 gap-3">
        {normalActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`
              ${action.color} text-white rounded-xl p-4 shadow-md
              transform transition-all duration-200 hover:scale-105 active:scale-95
              hover:shadow-lg
            `}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <action.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{action.title}</h4>
                <p className="text-white text-opacity-80 text-xs mt-1">
                  {action.subtitle}
                </p>
              </div>
              {action.badge && (
                <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  <span className="text-xs font-medium">{action.badge}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* 추가 팁 또는 정보 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              💡 빠른 팁
            </h4>
            <p className="text-xs text-blue-700">
              출석 체크 버튼을 길게 누르면 QR 코드 스캔 모드로 바로 이동할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 로딩 스켈레톤
export function QuickActionsSkeleton() {
  return (
    <div className="space-y-4">
      {/* 큰 버튼 스켈레톤 */}
      <div className="w-full bg-gray-200 rounded-xl p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gray-300 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* 작은 버튼들 스켈레톤 */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl p-4 animate-pulse">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
              <div className="space-y-2 text-center">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}