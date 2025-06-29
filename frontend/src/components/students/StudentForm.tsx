'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  UserIcon,
  PhoneIcon,
  AcademicCapIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { ButtonLoader } from '@/components/ui/LoadingSpinner'

// 유효성 검증 스키마
const studentFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내로 입력해주세요'),
  grade: z.string().optional(),
  phone: z.string().optional().refine(
    (val) => !val || /^010-?\d{4}-?\d{4}$/.test(val.replace(/-/g, '')),
    '올바른 전화번호 형식을 입력해주세요 (010-1234-5678)'
  ),
  parent_phone: z.string().optional().refine(
    (val) => !val || /^010-?\d{4}-?\d{4}$/.test(val.replace(/-/g, '')),
    '올바른 전화번호 형식을 입력해주세요 (010-1234-5678)'
  ),
  subjects: z.array(z.object({
    name: z.string().min(1, '과목명을 입력해주세요')
  })).optional(),
  schedule: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
  memo: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentFormSchema>

interface StudentFormProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

const gradeOptions = [
  '초1', '초2', '초3', '초4', '초5', '초6',
  '중1', '중2', '중3',
  '고1', '고2', '고3',
  '기타'
]

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
]

const weekDays = [
  { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' },
  { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' },
  { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
  { key: 'sunday', label: '일' },
] as const

export default function StudentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: StudentFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'memo'>('basic')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      grade: initialData?.grade || '',
      phone: initialData?.phone || '',
      parent_phone: initialData?.parent_phone || '',
      subjects: initialData?.subjects || [{ name: '' }],
      schedule: initialData?.schedule || {},
      memo: initialData?.memo || '',
    },
    mode: 'onChange'
  })

  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({
    control,
    name: 'subjects'
  })

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (field: 'phone' | 'parent_phone', value: string) => {
    const formatted = formatPhoneNumber(value)
    setValue(field, formatted)
  }

  const addSubject = () => {
    appendSubject({ name: '' })
  }

  const removeSubjectField = (index: number) => {
    removeSubject(index)
  }

  const tabs = [
    { key: 'basic', label: '기본 정보', icon: UserIcon },
    { key: 'schedule', label: '시간표', icon: ClockIcon },
    { key: 'memo', label: '특이사항', icon: DocumentTextIcon },
  ] as const

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? '새 학생 등록' : '학생 정보 수정'}
        </h2>
      </div>

      {/* 탭 네비게이션 */}
      <div className="px-6 pt-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* 기본 정보 탭 */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.name ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="학생 이름을 입력하세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* 학년 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학년
              </label>
              <select
                {...register('grade')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">학년 선택</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* 학생 연락처 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학생 연락처
              </label>
              <input
                type="tel"
                {...register('phone')}
                onChange={(e) => handlePhoneChange('phone', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="010-1234-5678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* 학부모 연락처 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학부모 연락처
              </label>
              <input
                type="tel"
                {...register('parent_phone')}
                onChange={(e) => handlePhoneChange('parent_phone', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.parent_phone ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="010-1234-5678"
              />
              {errors.parent_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.parent_phone.message}</p>
              )}
            </div>

            {/* 수강 과목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수강 과목
              </label>
              <div className="space-y-2">
                {subjectFields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <input
                      {...register(`subjects.${index}.name`)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="과목명 (예: 수학, 영어)"
                    />
                    {subjectFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectField(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>과목 추가</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 시간표 탭 */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              각 요일별 수업 시간을 선택하세요.
            </div>
            {weekDays.map((day) => (
              <div key={day.key} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-700">
                  {day.label}
                </div>
                <select
                  {...register(`schedule.${day.key}`)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">시간 선택</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* 특이사항 탭 */}
        {activeTab === 'memo' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              특이사항
            </label>
            <textarea
              {...register('memo')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="학생에 대한 특이사항이나 주의사항을 기록하세요..."
            />
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && <ButtonLoader />}
            {mode === 'create' ? '등록하기' : '수정하기'}
          </button>
        </div>
      </form>
    </div>
  )
}