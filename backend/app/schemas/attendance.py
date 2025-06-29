from pydantic import BaseModel
from datetime import datetime, date, time
from typing import Optional
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
    pass

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