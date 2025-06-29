from pydantic import BaseModel, validator
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from enum import Enum

class PaymentMethod(str, Enum):
    cash = "cash"
    card = "card"
    transfer = "transfer"

class PaymentBase(BaseModel):
    student_id: int
    amount: Decimal
    payment_method: PaymentMethod
    start_date: date
    end_date: date
    sessions_total: int = 8
    sessions_completed: int = 0

class PaymentCreateRequest(BaseModel):
    student_id: int
    amount: Decimal
    payment_method: PaymentMethod
    start_date: date
    sessions_total: int = 8
    exclude_weekends: bool = True
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v
    
    @validator('sessions_total')
    def validate_sessions_total(cls, v):
        if v <= 0 or v > 50:
            raise ValueError('Sessions total must be between 1 and 50')
        return v

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    payment_method: Optional[PaymentMethod] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    sessions_total: Optional[int] = None
    sessions_completed: Optional[int] = None
    is_active: Optional[bool] = None

class Payment(PaymentBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PaymentWithStudent(Payment):
    student_name: str
    student_grade: Optional[str] = None
    days_until_expiry: Optional[int] = None
    progress_percentage: float

class SessionCompleteRequest(BaseModel):
    attendance_id: Optional[int] = None
    note: Optional[str] = None

class PaymentExtendRequest(BaseModel):
    additional_sessions: int
    additional_amount: Decimal
    
    @validator('additional_sessions')
    def validate_additional_sessions(cls, v):
        if v <= 0 or v > 20:
            raise ValueError('Additional sessions must be between 1 and 20')
        return v
    
    @validator('additional_amount')
    def validate_additional_amount(cls, v):
        if v <= 0:
            raise ValueError('Additional amount must be greater than 0')
        return v

class PaymentStats(BaseModel):
    period: str
    total_revenue: Decimal
    active_payments_count: int
    expiring_soon_count: int
    completed_payments_count: int
    average_payment_amount: Decimal
    monthly_revenue_trend: List[Dict[str, Any]]
    payment_method_distribution: Dict[str, int]

class ExpiringPayment(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_grade: Optional[str] = None
    amount: Decimal
    sessions_total: int
    sessions_completed: int
    end_date: date
    days_until_expiry: int
    progress_percentage: float