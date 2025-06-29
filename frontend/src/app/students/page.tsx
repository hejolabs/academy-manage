'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon } from '@heroicons/react/24/outline'
import SearchAndFilter from '@/components/students/SearchAndFilter'
import StudentCard, { StudentCardSkeleton } from '@/components/students/StudentCard'
import StudentForm from '@/components/students/StudentForm'
import { AutoFloatingActionButton } from '@/components/ui/FloatingActionButton'
import { InlineLoader } from '@/components/ui/LoadingSpinner'
import { api } from '@/lib/api'

interface Student {
  id: number
  name: string
  grade?: string
  phone?: string
  parent_phone?: string
  subjects?: string[]
  is_active: boolean
  created_at: string
  attendance_rate?: number
  active_payment?: {
    id: number
    end_date: string
    days_until_expiry: number
    progress_percentage: number
  }
}

export default function StudentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'attendance_rate'>('name')
  const [currentPage, setCurrentPage] = useState(0)
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // URL 파라미터로 폼 표시 제어
  useEffect(() => {
    const action = searchParams.get('action')
    setShowForm(action === 'new')
  }, [searchParams])

  // 학생 목록 로드
  const loadStudents = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        search: searchTerm || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        limit: 20,
        offset: reset ? 0 : currentPage * 20,
      }

      const response = await api.getStudents(params)
      
      if (response.success && response.data) {
        const newStudents = response.data.students || []
        
        if (reset) {
          setStudents(newStudents)
          setCurrentPage(0)
        } else {
          setStudents(prev => [...prev, ...newStudents])
        }
        
        setTotalCount(response.data.total || 0)
        setHasMore(newStudents.length === 20)
      } else {
        setError(response.error || '학생 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      setError('학생 목록을 불러오는데 실패했습니다.')
      console.error('Error loading students:', err)
    } finally {
      setLoading(false)
    }
  }

  // 검색/필터 변경 시 리로드
  useEffect(() => {
    loadStudents(true)
  }, [searchTerm, statusFilter, sortBy])

  // 더 보기 (페이징)
  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1)
      loadStudents(false)
    }
  }

  // 새 학생 등록
  const handleCreateStudent = async (data: any) => {
    try {
      setIsSubmitting(true)
      
      // subjects 배열 필터링 (빈 값 제거)
      const cleanedSubjects = data.subjects?.filter((s: any) => s.name.trim()).map((s: any) => s.name) || []
      
      const studentData = {
        ...data,
        subjects: cleanedSubjects.length > 0 ? cleanedSubjects : undefined,
      }

      const response = await api.createStudent(studentData)
      
      if (response.success) {
        setShowForm(false)
        router.push('/students')
        loadStudents(true) // 목록 새로고침
      } else {
        throw new Error(response.error || '학생 등록에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error creating student:', err)
      alert('학생 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 폼 취소
  const handleCancelForm = () => {
    setShowForm(false)
    router.push('/students')
  }

  // 새 학생 등록 버튼
  const handleAddStudent = () => {
    setShowForm(true)
    router.push('/students?action=new')
  }

  // 필터링된 학생 목록
  const getFilteredStudents = () => {
    let filtered = [...students]

    // 상태 필터링
    if (statusFilter === 'expiring') {
      filtered = filtered.filter(student => 
        student.active_payment && student.active_payment.days_until_expiry <= 7
      )
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(student => !student.is_active)
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'attendance_rate':
          return (b.attendance_rate || 0) - (a.attendance_rate || 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'ko')
      }
    })

    return filtered
  }

  const filteredStudents = getFilteredStudents()

  if (showForm) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <StudentForm
          mode="create"
          onSubmit={handleCreateStudent}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-gray-600 mt-1">학생 정보를 관리하세요</p>
        </div>
        <button
          onClick={handleAddStudent}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>학생 추가</span>
        </button>
      </div>

      {/* 검색 및 필터 */}
      <SearchAndFilter
        searchValue={searchTerm}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onSearchChange={setSearchTerm}
        onStatusFilter={setStatusFilter}
        onSortChange={setSortBy}
        totalCount={totalCount}
      />

      {/* 학생 목록 */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => loadStudents(true)}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            다시 시도
          </button>
        </div>
      ) : filteredStudents.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
          </p>
          <button
            onClick={handleAddStudent}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            첫 번째 학생 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
          
          {/* 로딩 스켈레톤 */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <StudentCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* 더 보기 버튼 */}
          {!loading && hasMore && filteredStudents.length < totalCount && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                더 보기 ({filteredStudents.length}/{totalCount})
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <AutoFloatingActionButton />
    </div>
  )
}