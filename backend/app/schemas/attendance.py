from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttendanceBase(BaseModel):
    student_id: int
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    is_present: bool = True
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    check_out_time: Optional[datetime] = None
    is_present: Optional[bool] = None
    notes: Optional[str] = None

class Attendance(AttendanceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True