'use client'

import { useState } from 'react'
import { CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const attendanceData = [
    { id: 1, name: '김철수', grade: '중3', status: 'present', time: '09:30' },
    { id: 2, name: '이영희', grade: '고1', status: 'present', time: '09:45' },
    { id: 3, name: '박민수', grade: '중2', status: 'absent', time: null },
    { id: 4, name: '정수연', grade: '고2', status: 'present', time: '10:15' },
    { id: 5, name: '최지훈', grade: '중3', status: 'late', time: '11:30' },
  ]

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(s => s.status === 'present').length,
    absent: attendanceData.filter(s => s.status === 'absent').length,
    late: attendanceData.filter(s => s.status === 'late').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return '출석'
      case 'absent': return '결석'
      case 'late': return '지각'
      default: return '미확인'
    }
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">출석 관리</h1>
        <p className="text-gray-600">
          {format(selectedDate, 'yyyy년 M월 d일 EEEE', { locale: ko })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="flex justify-center mb-2">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
          <p className="text-sm text-gray-600">출석</p>
        </div>
        
        <div className="card text-center">
          <div className="flex justify-center mb-2">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
          <p className="text-sm text-gray-600">결석</p>
        </div>
        
        <div className="card text-center">
          <div className="flex justify-center mb-2">
            <CalendarIcon className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
          <p className="text-sm text-gray-600">지각</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">출석 현황</h2>
          <button className="btn-primary text-sm">일괄 출석</button>
        </div>
        
        <div className="space-y-3">
          {attendanceData.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {student.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">
                    {student.grade} {student.time && `• ${student.time}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                  {getStatusText(student.status)}
                </span>
                <button className="btn-secondary text-sm py-1 px-3">
                  변경
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}