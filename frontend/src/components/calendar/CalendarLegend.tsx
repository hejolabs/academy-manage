'use client'

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface CalendarFilters {
  showSessionComplete: boolean
  showPaymentExpire: boolean
  showClassDays: boolean
  showHolidays: boolean
}

interface CalendarLegendProps {
  filters: CalendarFilters
  onFilterChange: (filterKey: keyof CalendarFilters) => void
}

interface LegendItem {
  key: keyof CalendarFilters
  label: string
  color: string
  emoji: string
  description: string
}

const legendItems: LegendItem[] = [
  {
    key: 'showSessionComplete',
    label: '8회차 완료 예정',
    color: 'bg-green-500',
    emoji: '🟢',
    description: '학생의 8회차 수업 완료 예정일'
  },
  {
    key: 'showPaymentExpire',
    label: '결제 만료 예정',
    color: 'bg-red-500',
    emoji: '🔴',
    description: '학생 결제 만료 예정일'
  },
  {
    key: 'showClassDays',
    label: '정규 수업일',
    color: 'bg-blue-500',
    emoji: '🔵',
    description: '월/수/금 정규 수업일'
  },
  {
    key: 'showHolidays',
    label: '휴무일',
    color: 'bg-orange-500',
    emoji: '⚪',
    description: '공휴일 및 휴무일'
  }
]

export default function CalendarLegend({ filters, onFilterChange }: CalendarLegendProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">범례 및 필터</h3>
        <span className="text-sm text-gray-600">
          클릭하여 표시/숨김
        </span>
      </div>

      {/* 범례 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {legendItems.map((item) => {
          const isVisible = filters[item.key]
          
          return (
            <button
              key={item.key}
              onClick={() => onFilterChange(item.key)}
              className={`
                flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200
                ${isVisible 
                  ? 'border-gray-300 bg-white shadow-sm' 
                  : 'border-gray-200 bg-gray-50 opacity-60'
                }
                hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              {/* 색상 표시기 */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-lg">{item.emoji}</span>
              </div>

              {/* 라벨 및 설명 */}
              <div className="flex-1 text-left">
                <div className={`text-sm font-medium ${isVisible ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item.label}
                </div>
                <div className={`text-xs ${isVisible ? 'text-gray-600' : 'text-gray-400'}`}>
                  {item.description}
                </div>
              </div>

              {/* 표시/숨김 아이콘 */}
              <div className="flex-shrink-0">
                {isVisible ? (
                  <EyeIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* 사용법 안내 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 text-sm">💡</div>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">사용법</div>
            <ul className="space-y-1 text-xs">
              <li>• 각 항목을 클릭하여 캘린더에서 표시/숨김을 설정할 수 있습니다</li>
              <li>• 날짜를 클릭하면 해당 날의 상세 정보를 확인할 수 있습니다</li>
              <li>• 🟢 완료 예정일은 현재 출석 진도를 기반으로 자동 계산됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}