'use client'

import { usePathname } from 'next/navigation'
import { 
  PlusIcon, 
  UserPlusIcon, 
  CheckIcon, 
  CalendarIcon,
  CreditCardIcon 
} from '@heroicons/react/24/outline'
import { ReactNode } from 'react'

interface FloatingActionButtonProps {
  onClick?: () => void
  icon?: ReactNode
  label?: string
  className?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
  orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
}

// 페이지별 FAB 설정
const pageActions = {
  '/': {
    icon: <CheckIcon className="w-6 h-6" />,
    label: '빠른 출석',
    color: 'green' as const,
    action: () => console.log('Quick attendance check'),
  },
  '/students': {
    icon: <UserPlusIcon className="w-6 h-6" />,
    label: '학생 추가',
    color: 'blue' as const,
    action: () => console.log('Add new student'),
  },
  '/attendance': {
    icon: <CheckIcon className="w-6 h-6" />,
    label: '출석 체크',
    color: 'green' as const,
    action: () => console.log('Mark attendance'),
  },
  '/calendar': {
    icon: <CalendarIcon className="w-6 h-6" />,
    label: '일정 추가',
    color: 'purple' as const,
    action: () => console.log('Add schedule'),
  },
  '/payments': {
    icon: <CreditCardIcon className="w-6 h-6" />,
    label: '결제 등록',
    color: 'orange' as const,
    action: () => console.log('Add payment'),
  },
}

export default function FloatingActionButton({
  onClick,
  icon,
  label,
  className = '',
  color = 'blue'
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-20 right-4 z-40
        ${colorClasses[color]}
        text-white rounded-full p-4 shadow-lg
        transition-all duration-200 transform
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        ${className}
      `}
      aria-label={label}
    >
      {icon || <PlusIcon className="w-6 h-6" />}
      
      {/* 라벨 툴팁 (호버 시 표시) */}
      {label && (
        <span className="
          absolute right-full mr-3 top-1/2 transform -translate-y-1/2
          bg-gray-900 text-white text-xs px-2 py-1 rounded
          opacity-0 pointer-events-none transition-opacity duration-200
          hover:opacity-100 whitespace-nowrap
        ">
          {label}
        </span>
      )}
    </button>
  )
}

// 페이지에 맞는 자동 FAB
export function AutoFloatingActionButton() {
  const pathname = usePathname()
  const config = pageActions[pathname as keyof typeof pageActions]

  if (!config) return null

  return (
    <FloatingActionButton
      icon={config.icon}
      label={config.label}
      color={config.color}
      onClick={config.action}
    />
  )
}

// 미니 FAB (작은 크기)
export function MiniFAB({
  onClick,
  icon,
  label,
  color = 'blue'
}: Omit<FloatingActionButtonProps, 'className'>) {
  return (
    <button
      onClick={onClick}
      className={`
        ${colorClasses[color]}
        text-white rounded-full p-3 shadow-md
        transition-all duration-200 transform
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-opacity-50
      `}
      aria-label={label}
    >
      {icon || <PlusIcon className="w-5 h-5" />}
    </button>
  )
}

// 확장 가능한 FAB (여러 액션)
interface ExtendedFABProps {
  mainAction: {
    icon: ReactNode
    label: string
    onClick: () => void
  }
  actions: Array<{
    icon: ReactNode
    label: string
    onClick: () => void
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }>
  isExpanded: boolean
  onToggle: () => void
}

export function ExtendedFAB({ 
  mainAction, 
  actions, 
  isExpanded, 
  onToggle 
}: ExtendedFABProps) {
  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* 서브 액션들 */}
      {isExpanded && (
        <div className="flex flex-col-reverse items-end space-y-reverse space-y-3 mb-3">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="
                bg-gray-900 text-white text-xs px-2 py-1 rounded
                whitespace-nowrap
              ">
                {action.label}
              </span>
              <MiniFAB
                icon={action.icon}
                label={action.label}
                color={action.color || 'blue'}
                onClick={() => {
                  action.onClick()
                  onToggle()
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 메인 FAB */}
      <FloatingActionButton
        icon={mainAction.icon}
        label={mainAction.label}
        onClick={onToggle}
        className={`transform transition-transform duration-200 ${
          isExpanded ? 'rotate-45' : ''
        }`}
      />
    </div>
  )
}