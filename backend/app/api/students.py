from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Optional
from datetime import datetime, timedelta
import math

from ..database.connection import get_db
from ..models.student import Student
from ..models.attendance import Attendance
from ..models.payment import Payment
from ..schemas.student import (
    Student as StudentSchema, 
    StudentCreate, 
    StudentUpdate,
    StudentListResponse,
    StudentListItem,
    StudentDetail,
    ActivePaymentInfo
)

router = APIRouter(prefix="/students", tags=["students"])

def calculate_attendance_rate(student_id: int, db: Session) -> Optional[float]:
    """Calculate attendance rate for a student in the last 30 days"""
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    
    total_records = db.query(Attendance).filter(
        and_(
            Attendance.student_id == student_id,
            Attendance.date >= thirty_days_ago
        )
    ).count()
    
    if total_records == 0:
        return None
    
    present_records = db.query(Attendance).filter(
        and_(
            Attendance.student_id == student_id,
            Attendance.date >= thirty_days_ago,
            Attendance.status == "present"
        )
    ).count()
    
    return round((present_records / total_records) * 100, 1)

def get_active_payment(student_id: int, db: Session) -> Optional[ActivePaymentInfo]:
    """Get active payment information for a student"""
    active_payment = db.query(Payment).filter(
        and_(
            Payment.student_id == student_id,
            Payment.is_active == True
        )
    ).first()
    
    if not active_payment:
        return None
    
    return ActivePaymentInfo(
        id=active_payment.id,
        amount=active_payment.amount,
        sessions_total=active_payment.sessions_total,
        sessions_completed=active_payment.sessions_completed,
        start_date=active_payment.start_date.isoformat(),
        end_date=active_payment.end_date.isoformat()
    )

@router.get("/", response_model=StudentListResponse)
def get_students(
    search: Optional[str] = Query(None, description="Search by student name"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    db: Session = Depends(get_db)
):
    """Get paginated list of students with attendance rate and active payment info"""
    
    # Base query
    query = db.query(Student)
    
    # Apply filters
    if search:
        query = query.filter(Student.name.ilike(f"%{search}%"))
    
    if is_active is not None:
        query = query.filter(Student.is_active == is_active)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    students = query.offset(offset).limit(limit).all()
    
    # Build response with additional data
    student_items = []
    for student in students:
        attendance_rate = calculate_attendance_rate(student.id, db)
        active_payment = get_active_payment(student.id, db)
        
        student_item = StudentListItem(
            **student.__dict__,
            attendance_rate=attendance_rate,
            active_payment=active_payment
        )
        student_items.append(student_item)
    
    # Calculate pagination info
    page = (offset // limit) + 1
    total_pages = math.ceil(total / limit)
    
    return StudentListResponse(
        students=student_items,
        total=total,
        page=page,
        per_page=limit,
        total_pages=total_pages
    )

@router.post("/", response_model=StudentSchema, status_code=status.HTTP_201_CREATED)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    try:
        db_student = Student(**student.model_dump())
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create student: {str(e)}"
        )

@router.get("/{student_id}", response_model=StudentDetail)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get recent attendance records (last 10)
    recent_attendances = db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).order_by(Attendance.date.desc()).limit(10).all()
    
    attendance_data = []
    for attendance in recent_attendances:
        attendance_data.append({
            "id": attendance.id,
            "date": attendance.date.isoformat(),
            "status": attendance.status,
            "time_in": attendance.time_in.isoformat() if attendance.time_in else None,
            "time_out": attendance.time_out.isoformat() if attendance.time_out else None,
            "note": attendance.note
        })
    
    # Get active payments
    active_payments = db.query(Payment).filter(
        and_(
            Payment.student_id == student_id,
            Payment.is_active == True
        )
    ).all()
    
    payment_data = []
    for payment in active_payments:
        payment_data.append(ActivePaymentInfo(
            id=payment.id,
            amount=payment.amount,
            sessions_total=payment.sessions_total,
            sessions_completed=payment.sessions_completed,
            start_date=payment.start_date.isoformat(),
            end_date=payment.end_date.isoformat()
        ))
    
    return StudentDetail(
        **student.__dict__,
        recent_attendances=attendance_data,
        active_payments=payment_data
    )

@router.put("/{student_id}", response_model=StudentSchema)
def update_student(
    student_id: int, 
    student_update: StudentUpdate, 
    db: Session = Depends(get_db)
):
    """Update student information"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    try:
        update_data = student_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(student, field, value)
        
        db.commit()
        db.refresh(student)
        return student
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update student: {str(e)}"
        )

@router.delete("/{student_id}", status_code=status.HTTP_200_OK)
def deactivate_student(student_id: int, db: Session = Depends(get_db)):
    """Deactivate a student (soft delete)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    try:
        student.is_active = False
        db.commit()
        return {"message": "Student deactivated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to deactivate student: {str(e)}"
        )