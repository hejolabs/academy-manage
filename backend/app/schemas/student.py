from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

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