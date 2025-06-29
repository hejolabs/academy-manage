from pydantic import BaseModel, validator
from datetime import datetime, date, time
from typing import Optional, List, Dict, Any
from enum import Enum

class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    early_leave = "early_leave"

class AttendanceBase(BaseModel):
    student_id: int
    date: date
    status: AttendanceStatus
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    note: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    @validator('date')
    def validate_date(cls, v):
        if v > date.today():
            raise ValueError('Date cannot be in the future')
        return v

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    note: Optional[str] = None

class Attendance(AttendanceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AttendanceWithStudent(Attendance):
    student_name: str
    student_grade: Optional[str] = None

class TodayAttendanceItem(BaseModel):
    student_id: int
    student_name: str
    student_grade: Optional[str] = None
    attendance_id: Optional[int] = None
    status: Optional[AttendanceStatus] = None
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    note: Optional[str] = None

class AttendanceStats(BaseModel):
    student_id: int
    student_name: str
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    early_leave_days: int
    attendance_rate: float
    consecutive_present: int
    consecutive_absent: int
    monthly_trend: List[Dict[str, Any]]

class BulkAttendanceItem(BaseModel):
    student_id: int
    status: AttendanceStatus
    time_in: Optional[time] = None
    note: Optional[str] = None

class BulkAttendanceRequest(BaseModel):
    date: Optional[date] = None
    attendances: List[BulkAttendanceItem]
    
    @validator('date')
    def validate_date(cls, v):
        if v and v > date.today():
            raise ValueError('Date cannot be in the future')
        return v or date.today()

class BulkAttendanceResult(BaseModel):
    success_count: int
    error_count: int
    errors: List[Dict[str, Any]]
    created_attendances: List[Attendance]