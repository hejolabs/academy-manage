from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Time, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database.base import Base

class Attendance(Base):
    __tablename__ = "attendances"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)  # "present", "absent", "late", "early_leave"
    time_in = Column(Time)
    time_out = Column(Time)
    note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("Student", back_populates="attendances")