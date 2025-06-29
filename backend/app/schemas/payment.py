from pydantic import BaseModel
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
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