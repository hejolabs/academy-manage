'use client'

import { ArrowLeftIcon, PhoneIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  const student = {
    id: params.id,
    name: '김철수',
    grade: '중학교 3학년',
    phone: '010-1234-5678',
    parentPhone: '010-9876-5432',
    address: '서울시 강남구 역삼동 123-45',
    registeredDate: '2024-03-01',
    status: '정상',
    monthlyFee: 200000,
    recentAttendance: [
      { date: '2024-06-28', status: '출석' },
      { date: '2024-06-27', status: '출석' },
      { date: '2024-06-26', status: '결석' },
      { date: '2024-06-25', status: '출석' },
      { date: '2024-06-24', status: '출석' },
    ]
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{student.grade}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">학생 연락처</p>
                <p className="font-medium">{student.phone}</p>
              </div>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">학부모 연락처</p>
                <p className="font-medium">{student.parentPhone}</p>
              </div>
            </div>
            <div className="flex items-center">
              <AcademicCapIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">학년</p>
                <p className="font-medium">{student.grade}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 출석 현황</h2>
          <div className="space-y-2">
            {student.recentAttendance.map((record, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="text-gray-600">{record.date}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  record.status === '출석' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="btn-primary flex-1">수정</button>
          <button className="btn-secondary flex-1">출석 체크</button>
        </div>
      </div>
    </div>
  )
}