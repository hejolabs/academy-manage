'use client'

import { useState } from 'react'
import { CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState('pending')
  
  const payments = [
    { id: 1, studentName: '김철수', grade: '중3', amount: 200000, dueDate: '2024-06-30', status: 'pending' },
    { id: 2, studentName: '이영희', grade: '고1', amount: 220000, dueDate: '2024-06-25', status: 'completed', paidDate: '2024-06-20' },
    { id: 3, studentName: '박민수', grade: '중2', amount: 180000, dueDate: '2024-06-20', status: 'overdue' },
    { id: 4, studentName: '정수연', grade: '고2', amount: 240000, dueDate: '2024-07-05', status: 'pending' },
  ]
  
  const filteredPayments = payments.filter(payment => {
    if (selectedTab === 'all') return true
    return payment.status === selectedTab
  })
  
  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료'
      case 'pending': return '대기'
      case 'overdue': return '연체'
      default: return '미확인'
    }
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">수납 관리</h1>
        <p className="text-gray-600">이번 달 수납 현황을 관리하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">이번 달 총 수납</p>
              <p className="text-xl font-bold text-gray-900">
                ₩{stats.completed.toLocaleString()}
              </p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">미수납</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-red-600">연체 {stats.overdue}건</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'all', label: '전체' },
            { key: 'pending', label: '대기' },
            { key: 'completed', label: '완료' },
            { key: 'overdue', label: '연체' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                selectedTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {payment.studentName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{payment.studentName}</h3>
                  <p className="text-sm text-gray-600">
                    {payment.grade} • 마감일: {payment.dueDate}
                  </p>
                  {payment.paidDate && (
                    <p className="text-sm text-green-600">납부일: {payment.paidDate}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₩{payment.amount.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>
                  {payment.status === 'pending' && (
                    <button className="btn-primary text-xs py-1 px-2">
                      수납
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}