'use client'

import { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface SearchAndFilterProps {
  onSearchChange: (search: string) => void
  onStatusFilter: (status: 'all' | 'active' | 'expiring' | 'inactive') => void
  onSortChange: (sort: 'name' | 'created_at' | 'attendance_rate') => void
  searchValue: string
  statusFilter: 'all' | 'active' | 'expiring' | 'inactive'
  sortBy: 'name' | 'created_at' | 'attendance_rate'
  totalCount?: number
  className?: string
}

const statusOptions = [
  { value: 'all', label: '전체', color: 'bg-gray-100 text-gray-800' },
  { value: 'active', label: '활성', color: 'bg-green-100 text-green-800' },
  { value: 'expiring', label: '만료임박', color: 'bg-orange-100 text-orange-800' },
  { value: 'inactive', label: '비활성', color: 'bg-red-100 text-red-800' },
] as const

const sortOptions = [
  { value: 'name', label: '이름순' },
  { value: 'created_at', label: '등록일순' },
  { value: 'attendance_rate', label: '출석률순' },
] as const

export default function SearchAndFilter({
  onSearchChange,
  onStatusFilter,
  onSortChange,
  searchValue,
  statusFilter,
  sortBy,
  totalCount,
  className = ''
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const handleClearSearch = () => {
    onSearchChange('')
  }

  const handleStatusFilter = (status: typeof statusFilter) => {
    onStatusFilter(status)
  }

  const handleSortChange = (sort: typeof sortBy) => {
    onSortChange(sort)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const activeFiltersCount = () => {
    let count = 0
    if (statusFilter !== 'all') count++
    if (sortBy !== 'name') count++
    return count
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 검색바와 필터 토글 */}
      <div className="flex items-center space-x-3">
        {/* 검색 입력 */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="학생 이름으로 검색..."
            value={searchValue}
            onChange={handleSearchChange}
            className="
              block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              placeholder-gray-400 text-sm
            "
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* 필터 토글 버튼 */}
        <button
          onClick={toggleFilters}
          className={`
            relative p-3 rounded-xl border transition-colors
            ${showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <FunnelIcon className="w-5 h-5" />
          {activeFiltersCount() > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount()}
            </div>
          )}
        </button>
      </div>

      {/* 결과 수 표시 */}
      {totalCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>총 {totalCount.toLocaleString()}명의 학생</span>
          {searchValue && (
            <span>'{searchValue}' 검색 결과</span>
          )}
        </div>
      )}

      {/* 필터 옵션 */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          {/* 상태 필터 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">상태</h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusFilter(option.value)}
                  className={`
                    px-3 py-2 rounded-full text-sm font-medium transition-colors
                    ${statusFilter === option.value
                      ? option.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 옵션 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-1">
              <ArrowsUpDownIcon className="w-4 h-4" />
              <span>정렬</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`
                    px-3 py-2 rounded-full text-sm font-medium transition-colors
                    ${sortBy === option.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 필터 초기화 */}
          {activeFiltersCount() > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  onStatusFilter('all')
                  onSortChange('name')
                }}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>
      )}

      {/* 활성 필터 요약 (필터가 닫혔을 때) */}
      {!showFilters && activeFiltersCount() > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">적용된 필터:</span>
          {statusFilter !== 'all' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {statusOptions.find(opt => opt.value === statusFilter)?.label}
            </span>
          )}
          {sortBy !== 'name' && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// 검색 및 필터 스켈레톤
export function SearchAndFilterSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  )
}