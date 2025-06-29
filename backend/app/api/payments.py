from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import Optional, List
from datetime import datetime, date, timedelta
from collections import defaultdict
from decimal import Decimal

from ..database.connection import get_db
from ..models.payment import Payment
from ..models.student import Student
from ..models.attendance import Attendance
from ..schemas.payment import (
    Payment as PaymentSchema,
    PaymentCreateRequest,
    PaymentWithStudent,
    SessionCompleteRequest,
    PaymentExtendRequest,
    PaymentStats,
    ExpiringPayment
)
from ..utils.date_calculator import (
    calculate_session_end_date,
    calculate_days_until_expiry,
    calculate_progress_percentage,
    get_current_year_holidays
)

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/", response_model=PaymentSchema, status_code=status.HTTP_201_CREATED)
def create_payment(payment_request: PaymentCreateRequest, db: Session = Depends(get_db)):
    """Create a new payment with automatic end date calculation"""
    
    # Check if student exists
    student = db.query(Student).filter(Student.id == payment_request.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    try:
        # Calculate end date based on sessions and business logic
        holidays = get_current_year_holidays() if payment_request.exclude_weekends else []
        end_date = calculate_session_end_date(
            start_date=payment_request.start_date,
            total_sessions=payment_request.sessions_total,
            exclude_weekends=payment_request.exclude_weekends,
            holidays=holidays
        )
        
        # Deactivate any existing active payments for this student
        existing_active_payments = db.query(Payment).filter(
            and_(
                Payment.student_id == payment_request.student_id,
                Payment.is_active == True
            )
        ).all()
        
        for existing_payment in existing_active_payments:
            existing_payment.is_active = False
        
        # Create new payment
        db_payment = Payment(
            student_id=payment_request.student_id,
            amount=payment_request.amount,
            payment_method=payment_request.payment_method,
            start_date=payment_request.start_date,
            end_date=end_date,
            sessions_total=payment_request.sessions_total,
            sessions_completed=0,
            is_active=True
        )
        
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create payment: {str(e)}"
        )

@router.get("/", response_model=List[PaymentWithStudent])
def get_payments(
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    expires_within_days: Optional[int] = Query(None, description="Filter payments expiring within N days"),
    limit: int = Query(100, ge=1, le=500, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db)
):
    """Get payments with optional filtering"""
    
    # Build query with joins
    query = db.query(
        Payment.id,
        Payment.student_id,
        Payment.amount,
        Payment.payment_method,
        Payment.start_date,
        Payment.end_date,
        Payment.sessions_total,
        Payment.sessions_completed,
        Payment.is_active,
        Payment.created_at,
        Payment.updated_at,
        Student.name.label('student_name'),
        Student.grade.label('student_grade')
    ).join(Student, Payment.student_id == Student.id)
    
    # Apply filters
    if student_id:
        query = query.filter(Payment.student_id == student_id)
    
    if is_active is not None:
        query = query.filter(Payment.is_active == is_active)
    
    if expires_within_days is not None:
        cutoff_date = date.today() + timedelta(days=expires_within_days)
        query = query.filter(
            and_(
                Payment.end_date <= cutoff_date,
                Payment.is_active == True
            )
        )
    
    # Order by creation date desc
    query = query.order_by(desc(Payment.created_at))
    
    # Apply pagination
    results = query.offset(offset).limit(limit).all()
    
    # Convert to response format
    payment_records = []
    for result in results:
        days_until_expiry = calculate_days_until_expiry(result.end_date)
        progress_percentage = calculate_progress_percentage(
            result.sessions_completed, 
            result.sessions_total
        )
        
        payment_records.append(PaymentWithStudent(
            id=result.id,
            student_id=result.student_id,
            amount=result.amount,
            payment_method=result.payment_method,
            start_date=result.start_date,
            end_date=result.end_date,
            sessions_total=result.sessions_total,
            sessions_completed=result.sessions_completed,
            is_active=result.is_active,
            created_at=result.created_at,
            updated_at=result.updated_at,
            student_name=result.student_name,
            student_grade=result.student_grade,
            days_until_expiry=days_until_expiry,
            progress_percentage=progress_percentage
        ))
    
    return payment_records

@router.get("/expiring", response_model=List[ExpiringPayment])
def get_expiring_payments(
    days: int = Query(7, ge=1, le=30, description="Days ahead to check for expiring payments"),
    db: Session = Depends(get_db)
):
    """Get payments expiring within specified days"""
    
    today = date.today()
    cutoff_date = today + timedelta(days=days)
    
    results = db.query(
        Payment.id,
        Payment.student_id,
        Payment.amount,
        Payment.sessions_total,
        Payment.sessions_completed,
        Payment.end_date,
        Student.name.label('student_name'),
        Student.grade.label('student_grade')
    ).join(Student, Payment.student_id == Student.id).filter(
        and_(
            Payment.is_active == True,
            Payment.end_date <= cutoff_date,
            Payment.end_date >= today
        )
    ).order_by(Payment.end_date).all()
    
    expiring_payments = []
    for result in results:
        days_until_expiry = calculate_days_until_expiry(result.end_date)
        progress_percentage = calculate_progress_percentage(
            result.sessions_completed,
            result.sessions_total
        )
        
        expiring_payments.append(ExpiringPayment(
            id=result.id,
            student_id=result.student_id,
            student_name=result.student_name,
            student_grade=result.student_grade,
            amount=result.amount,
            sessions_total=result.sessions_total,
            sessions_completed=result.sessions_completed,
            end_date=result.end_date,
            days_until_expiry=days_until_expiry,
            progress_percentage=progress_percentage
        ))
    
    return expiring_payments

@router.put("/{payment_id}/complete-session", response_model=PaymentSchema)
def complete_session(
    payment_id: int,
    session_data: SessionCompleteRequest,
    db: Session = Depends(get_db)
):
    """Mark a session as completed and update payment progress"""
    
    # Get payment
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if not payment.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment is not active"
        )
    
    if payment.sessions_completed >= payment.sessions_total:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All sessions for this payment have already been completed"
        )
    
    try:
        # Increment sessions completed
        payment.sessions_completed += 1
        
        # If all sessions are completed, deactivate the payment
        if payment.sessions_completed >= payment.sessions_total:
            payment.is_active = False
        
        # If attendance_id is provided, verify it exists and belongs to the student
        if session_data.attendance_id:
            attendance = db.query(Attendance).filter(
                and_(
                    Attendance.id == session_data.attendance_id,
                    Attendance.student_id == payment.student_id
                )
            ).first()
            
            if not attendance:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance record not found or doesn't belong to this student"
                )
        
        db.commit()
        db.refresh(payment)
        return payment
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to complete session: {str(e)}"
        )

@router.get("/stats", response_model=PaymentStats)
def get_payment_stats(
    period: str = Query("monthly", regex="^(monthly|quarterly)$", description="Stats period"),
    db: Session = Depends(get_db)
):
    """Get payment and revenue statistics"""
    
    # Calculate date range based on period
    end_date = date.today()
    if period == "monthly":
        start_date = end_date - timedelta(days=90)  # Last 3 months
    else:  # quarterly
        start_date = end_date - timedelta(days=270)  # Last 9 months
    
    # Get payments for the period
    payments = db.query(Payment).filter(
        Payment.created_at >= datetime.combine(start_date, datetime.min.time())
    ).all()
    
    # Calculate basic stats
    total_revenue = sum(payment.amount for payment in payments)
    active_payments_count = len([p for p in payments if p.is_active])
    completed_payments_count = len([p for p in payments if not p.is_active])
    
    # Calculate expiring soon (within 7 days)
    today = date.today()
    expiring_cutoff = today + timedelta(days=7)
    expiring_soon_count = len([
        p for p in payments 
        if p.is_active and p.end_date <= expiring_cutoff
    ])
    
    # Calculate average payment amount
    average_amount = total_revenue / len(payments) if payments else Decimal('0')
    
    # Generate monthly revenue trend
    monthly_revenue = defaultdict(Decimal)
    payment_method_counts = defaultdict(int)
    
    for payment in payments:
        month_key = payment.created_at.strftime('%Y-%m')
        monthly_revenue[month_key] += payment.amount
        payment_method_counts[payment.payment_method] += 1
    
    monthly_trend = []
    for month_key in sorted(monthly_revenue.keys()):
        monthly_trend.append({
            'month': month_key,
            'revenue': float(monthly_revenue[month_key]),
            'payment_count': len([p for p in payments if p.created_at.strftime('%Y-%m') == month_key])
        })
    
    return PaymentStats(
        period=period,
        total_revenue=total_revenue,
        active_payments_count=active_payments_count,
        expiring_soon_count=expiring_soon_count,
        completed_payments_count=completed_payments_count,
        average_payment_amount=average_amount,
        monthly_revenue_trend=monthly_trend,
        payment_method_distribution=dict(payment_method_counts)
    )

@router.put("/{payment_id}/extend", response_model=PaymentSchema)
def extend_payment(
    payment_id: int,
    extend_data: PaymentExtendRequest,
    db: Session = Depends(get_db)
):
    """Extend a payment with additional sessions and amount"""
    
    # Get payment
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    try:
        # Update payment with extension
        payment.sessions_total += extend_data.additional_sessions
        payment.amount += extend_data.additional_amount
        
        # Recalculate end date based on remaining sessions
        remaining_sessions = payment.sessions_total - payment.sessions_completed
        if remaining_sessions > 0:
            # Calculate new end date from today
            holidays = get_current_year_holidays()
            new_end_date = calculate_session_end_date(
                start_date=date.today(),
                total_sessions=remaining_sessions,
                exclude_weekends=True,
                holidays=holidays
            )
            payment.end_date = new_end_date
            payment.is_active = True
        
        db.commit()
        db.refresh(payment)
        return payment
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extend payment: {str(e)}"
        )