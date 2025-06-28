from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional

class PaymentBase(BaseModel):
    student_id: int
    amount: Decimal
    payment_date: datetime
    payment_method: Optional[str] = None
    payment_status: str = "completed"
    description: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Payment(PaymentBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True