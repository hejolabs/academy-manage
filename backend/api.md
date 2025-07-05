# Study Room System API Documentation

## Overview
FastAPI-based backend system for managing study room operations including student enrollment, attendance tracking, and payment management.

- **Base URL**: `/api/v1`
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite
- **Authentication**: Not implemented (public endpoints)

## System Endpoints

### Root Endpoints
- `GET /` - System status message
- `GET /health` - Health check endpoint

---

## API Endpoints

### Students API (`/api/v1/students`)

#### 1. Get Students List
```http
GET /api/v1/students/
```
**Query Parameters:**
- `search` (optional): Search by student name
- `is_active` (optional): Filter by active status (true/false)
- `limit` (default: 10, max: 100): Number of items per page
- `offset` (default: 0): Number of items to skip

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "name": "홍길동",
      "grade": "중3",
      "phone": "010-1234-5678",
      "parent_phone": "010-9876-5432",
      "subjects": ["수학", "영어"],
      "schedule": {"월": "16:00-18:00", "수": "16:00-18:00"},
      "is_active": true,
      "memo": "메모",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z",
      "attendance_rate": 85.5,
      "active_payment": {
        "id": 1,
        "amount": 200000,
        "sessions_total": 8,
        "sessions_completed": 3,
        "progress_percentage": 37.5
      }
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### 2. Create Student
```http
POST /api/v1/students/
```
**Request Body:**
```json
{
  "name": "홍길동",
  "grade": "중3",
  "phone": "010-1234-5678",
  "parent_phone": "010-9876-5432",
  "subjects": ["수학", "영어"],
  "schedule": {"월": "16:00-18:00", "수": "16:00-18:00"},
  "memo": "메모"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "홍길동",
  "grade": "중3",
  "phone": "010-1234-5678",
  "parent_phone": "010-9876-5432",
  "subjects": ["수학", "영어"],
  "schedule": {"월": "16:00-18:00", "수": "16:00-18:00"},
  "is_active": true,
  "memo": "메모",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

#### 3. Get Student Details
```http
GET /api/v1/students/{student_id}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "홍길동",
  "grade": "중3",
  "phone": "010-1234-5678",
  "parent_phone": "010-9876-5432",
  "subjects": ["수학", "영어"],
  "schedule": {"월": "16:00-18:00", "수": "16:00-18:00"},
  "is_active": true,
  "memo": "메모",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z",
  "recent_attendances": [
    {
      "id": 1,
      "date": "2024-01-01",
      "status": "present",
      "time_in": "16:00:00",
      "time_out": "18:00:00",
      "note": "정상 출석"
    }
  ],
  "active_payments": [
    {
      "id": 1,
      "amount": 200000,
      "payment_method": "cash",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "sessions_total": 8,
      "sessions_completed": 3,
      "progress_percentage": 37.5
    }
  ]
}
```

#### 4. Update Student
```http
PUT /api/v1/students/{student_id}
```
**Request Body:** (All fields optional)
```json
{
  "name": "홍길동",
  "grade": "고1",
  "phone": "010-1234-5678",
  "parent_phone": "010-9876-5432",
  "subjects": ["수학", "영어", "과학"],
  "schedule": {"월": "16:00-18:00", "수": "16:00-18:00", "금": "16:00-18:00"},
  "memo": "업데이트된 메모"
}
```

**Response:** `200 OK` (Updated student object)

#### 5. Delete Student
```http
DELETE /api/v1/students/{student_id}
```

**Response:** `200 OK`
```json
{
  "message": "학생이 비활성화되었습니다."
}
```

---

### Attendance API (`/api/v1/attendance`)

#### 1. Get Attendance Records
```http
GET /api/v1/attendance/
```
**Query Parameters:**
- `date_filter` (optional): Filter by specific date (YYYY-MM-DD)
- `student_id` (optional): Filter by student ID
- `start_date` (optional): Filter from start date
- `end_date` (optional): Filter to end date
- `limit` (default: 100, max: 500): Number of records
- `offset` (default: 0): Records to skip

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "student_id": 1,
    "date": "2024-01-01",
    "status": "present",
    "time_in": "16:00:00",
    "time_out": "18:00:00",
    "note": "정상 출석",
    "created_at": "2024-01-01T16:00:00Z",
    "student_name": "홍길동",
    "student_grade": "중3"
  }
]
```

#### 2. Create Attendance
```http
POST /api/v1/attendance/
```
**Request Body:**
```json
{
  "student_id": 1,
  "date": "2024-01-01",
  "status": "present",
  "time_in": "16:00:00",
  "time_out": "18:00:00",
  "note": "정상 출석"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "student_id": 1,
  "date": "2024-01-01",
  "status": "present",
  "time_in": "16:00:00",
  "time_out": "18:00:00",
  "note": "정상 출석",
  "created_at": "2024-01-01T16:00:00Z"
}
```

#### 3. Update Attendance
```http
PUT /api/v1/attendance/{attendance_id}
```
**Request Body:** (All fields optional)
```json
{
  "status": "late",
  "time_in": "16:30:00",
  "time_out": "18:00:00",
  "note": "지각"
}
```

**Response:** `200 OK` (Updated attendance object)

#### 4. Get Today's Attendance
```http
GET /api/v1/attendance/today
```

**Response:** `200 OK`
```json
[
  {
    "student_id": 1,
    "student_name": "홍길동",
    "student_grade": "중3",
    "attendance_id": 1,
    "status": "present",
    "time_in": "16:00:00",
    "time_out": "18:00:00"
  }
]
```

#### 5. Get Attendance Statistics
```http
GET /api/v1/attendance/stats/{student_id}
```
**Query Parameters:**
- `period` (optional): "weekly" or "monthly"

**Response:** `200 OK`
```json
{
  "attendance_rate": 85.5,
  "total_sessions": 20,
  "present_count": 17,
  "absent_count": 2,
  "late_count": 1,
  "early_leave_count": 0,
  "current_streak": 5,
  "best_streak": 10,
  "weekly_trend": [
    {"week": "2024-W01", "rate": 80.0},
    {"week": "2024-W02", "rate": 90.0}
  ],
  "monthly_trend": [
    {"month": "2024-01", "rate": 85.0},
    {"month": "2024-02", "rate": 88.0}
  ]
}
```

#### 6. Bulk Create Attendance
```http
POST /api/v1/attendance/bulk
```
**Request Body:**
```json
{
  "date": "2024-01-01",
  "attendances": [
    {
      "student_id": 1,
      "status": "present",
      "time_in": "16:00:00",
      "time_out": "18:00:00",
      "note": "정상 출석"
    },
    {
      "student_id": 2,
      "status": "absent",
      "note": "결석"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "total_records": 2,
  "successful_records": 2,
  "failed_records": 0,
  "errors": []
}
```

---

### Payments API (`/api/v1/payments`)

#### 1. Create Payment
```http
POST /api/v1/payments/
```
**Request Body:**
```json
{
  "student_id": 1,
  "amount": 200000,
  "payment_method": "cash",
  "start_date": "2024-01-01",
  "sessions_total": 8,
  "exclude_weekends": true
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "student_id": 1,
  "amount": 200000,
  "payment_method": "cash",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "sessions_total": 8,
  "sessions_completed": 0,
  "is_active": true,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

#### 2. Get Payments
```http
GET /api/v1/payments/
```
**Query Parameters:**
- `student_id` (optional): Filter by student ID
- `is_active` (optional): Filter by active status
- `expires_within_days` (optional): Filter expiring payments
- `limit` (default: 100, max: 500): Number of records
- `offset` (default: 0): Records to skip

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "student_id": 1,
    "amount": 200000,
    "payment_method": "cash",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "sessions_total": 8,
    "sessions_completed": 3,
    "is_active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z",
    "student_name": "홍길동",
    "student_grade": "중3",
    "progress_percentage": 37.5,
    "remaining_sessions": 5,
    "days_until_expiry": 15
  }
]
```

#### 3. Get Expiring Payments
```http
GET /api/v1/payments/expiring
```
**Query Parameters:**
- `days` (default: 7, max: 30): Number of days to check

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "student_name": "홍길동",
    "student_grade": "중3",
    "amount": 200000,
    "end_date": "2024-01-31",
    "days_until_expiry": 3,
    "sessions_remaining": 5
  }
]
```

#### 4. Complete Session
```http
PUT /api/v1/payments/{payment_id}/complete-session
```
**Request Body:**
```json
{
  "attendance_id": 1,
  "note": "수업 완료"
}
```

**Response:** `200 OK` (Updated payment object)

#### 5. Get Payment Statistics
```http
GET /api/v1/payments/stats
```
**Query Parameters:**
- `period` (optional): "monthly" or "quarterly"

**Response:** `200 OK`
```json
{
  "total_revenue": 5000000,
  "total_payments": 25,
  "active_payments": 15,
  "expired_payments": 10,
  "average_payment_amount": 200000,
  "revenue_by_method": {
    "cash": 3000000,
    "card": 1500000,
    "transfer": 500000
  },
  "monthly_revenue": [
    {"month": "2024-01", "revenue": 2000000},
    {"month": "2024-02", "revenue": 3000000}
  ],
  "payment_method_distribution": {
    "cash": 60,
    "card": 30,
    "transfer": 10
  }
}
```

#### 6. Extend Payment
```http
PUT /api/v1/payments/{payment_id}/extend
```
**Request Body:**
```json
{
  "additional_sessions": 4,
  "additional_amount": 100000
}
```

**Response:** `200 OK` (Updated payment object)

---

## Database Schema

### Tables Overview

#### Students Table
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(20),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    subjects JSON,
    schedule JSON,
    is_active BOOLEAN DEFAULT TRUE,
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Attendances Table
```sql
CREATE TABLE attendances (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    time_in TIME,
    time_out TIME,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

#### Payments Table
```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    sessions_total INTEGER DEFAULT 8,
    sessions_completed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

### Relationships
```
Student (1) ←→ (N) Attendance
Student (1) ←→ (N) Payment
```

### Enums and Constants

#### Attendance Status
- `"present"` - 출석
- `"absent"` - 결석
- `"late"` - 지각
- `"early_leave"` - 조퇴

#### Payment Methods
- `"cash"` - 현금
- `"card"` - 카드
- `"transfer"` - 계좌이체

### Data Types

#### JSON Fields
- `students.subjects`: Array of strings `["수학", "영어"]`
- `students.schedule`: Object with day-time mappings `{"월": "16:00-18:00"}`

#### Validation Rules
- Amount must be greater than 0
- Sessions total: 1-50 range
- Extension sessions: 1-20 range
- Attendance dates cannot be in the future
- Payment dates must be valid date ranges

### Key Features

1. **Audit Trail**: All entities have created_at timestamps
2. **Soft Deletes**: Students and payments use is_active flags
3. **Cascade Operations**: Deleting students removes related data
4. **Flexible Storage**: JSON fields for subjects and schedules
5. **Business Logic**: Automatic session tracking and date calculations
6. **Statistics**: Built-in attendance rates and payment analytics

## Error Handling

### Common HTTP Status Codes
- `200 OK` - Successful operation
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "detail": "Error message",
  "type": "validation_error",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message"
    }
  ]
}
```

## Dependencies

### Main Dependencies
- FastAPI - Web framework
- SQLAlchemy - ORM
- Pydantic - Data validation
- Uvicorn - ASGI server
- python-multipart - File uploads
- python-jose - JWT tokens (if auth implemented)

### Database
- SQLite (default)
- Configurable via `DATABASE_URL` environment variable

## Development Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Run database migrations (auto-created on startup)
3. Start server: `uvicorn app.main:app --reload`
4. API documentation: `http://localhost:8000/docs`

## Notes

- All timestamps are in UTC
- Database uses SQLite with auto-migration
- CORS is enabled for all origins
- No authentication implemented (public API)
- Soft deletes prevent data loss
- Bulk operations support efficient data entry
- Statistics endpoints provide business insights