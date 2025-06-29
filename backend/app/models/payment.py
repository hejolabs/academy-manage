from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database.base import Base

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(20), nullable=False)  # "cash", "card", "transfer"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    sessions_total = Column(Integer, default=8)
    sessions_completed = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    student = relationship("Student", back_populates="payments")