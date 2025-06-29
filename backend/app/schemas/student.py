from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal

class StudentBase(BaseModel):
    name: str
    grade: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    subjects: Optional[List[str]] = None
    schedule: Optional[Dict[str, Any]] = None
    memo: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    subjects: Optional[List[str]] = None
    schedule: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    memo: Optional[str] = None

class Student(StudentBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ActivePaymentInfo(BaseModel):
    id: int
    amount: Decimal
    sessions_total: int
    sessions_completed: int
    start_date: str
    end_date: str

class StudentListItem(Student):
    attendance_rate: Optional[float] = None
    active_payment: Optional[ActivePaymentInfo] = None

class StudentDetail(Student):
    recent_attendances: List[Dict[str, Any]] = []
    active_payments: List[ActivePaymentInfo] = []

class StudentListResponse(BaseModel):
    students: List[StudentListItem]
    total: int
    page: int
    per_page: int
    total_pages: int