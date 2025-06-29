from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import Optional, List
from datetime import datetime, date, timedelta
from collections import defaultdict
import calendar

from ..database.connection import get_db
from ..models.attendance import Attendance
from ..models.student import Student
from ..schemas.attendance import (
    Attendance as AttendanceSchema,
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceWithStudent,
    TodayAttendanceItem,
    AttendanceStats,
    BulkAttendanceRequest,
    BulkAttendanceResult,
    AttendanceStatus
)

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.get("/", response_model=List[AttendanceWithStudent])
def get_attendance_records(
    date_filter: Optional[date] = Query(None, description="Filter by specific date"),
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    start_date: Optional[date] = Query(None, description="Filter from start date"),
    end_date: Optional[date] = Query(None, description="Filter to end date"),
    limit: int = Query(100, ge=1, le=500, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    db: Session = Depends(get_db)
):
    """Get attendance records with optional filtering"""
    
    # Build query with joins
    query = db.query(
        Attendance.id,
        Attendance.student_id,
        Attendance.date,
        Attendance.status,
        Attendance.time_in,
        Attendance.time_out,
        Attendance.note,
        Attendance.created_at,
        Student.name.label('student_name'),
        Student.grade.label('student_grade')
    ).join(Student, Attendance.student_id == Student.id)
    
    # Apply filters
    if date_filter:
        query = query.filter(Attendance.date == date_filter)
    
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    # Order by date desc, then by student name
    query = query.order_by(desc(Attendance.date), Student.name)
    
    # Apply pagination
    results = query.offset(offset).limit(limit).all()
    
    # Convert to response format
    attendance_records = []
    for result in results:
        attendance_records.append(AttendanceWithStudent(
            id=result.id,
            student_id=result.student_id,
            date=result.date,
            status=result.status,
            time_in=result.time_in,
            time_out=result.time_out,
            note=result.note,
            created_at=result.created_at,
            student_name=result.student_name,
            student_grade=result.student_grade
        ))
    
    return attendance_records

@router.post("/", response_model=AttendanceSchema, status_code=status.HTTP_201_CREATED)
def create_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    """Create attendance record with duplicate check"""
    
    # Check if student exists
    student = db.query(Student).filter(Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check for duplicate attendance on same date
    existing = db.query(Attendance).filter(
        and_(
            Attendance.student_id == attendance.student_id,
            Attendance.date == attendance.date
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance record already exists for student {student.name} on {attendance.date}"
        )
    
    try:
        db_attendance = Attendance(**attendance.model_dump())
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return db_attendance
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create attendance record: {str(e)}"
        )

@router.put("/{attendance_id}", response_model=AttendanceSchema)
def update_attendance(
    attendance_id: int,
    attendance_update: AttendanceUpdate,
    db: Session = Depends(get_db)
):
    """Update attendance record"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    try:
        update_data = attendance_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(attendance, field, value)
        
        db.commit()
        db.refresh(attendance)
        return attendance
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update attendance record: {str(e)}"
        )

@router.get("/today", response_model=List[TodayAttendanceItem])
def get_today_attendance(db: Session = Depends(get_db)):
    """Get today's attendance status for all active students"""
    today = date.today()
    
    # Get all active students with their attendance for today
    results = db.query(
        Student.id.label('student_id'),
        Student.name.label('student_name'),
        Student.grade.label('student_grade'),
        Attendance.id.label('attendance_id'),
        Attendance.status,
        Attendance.time_in,
        Attendance.time_out,
        Attendance.note
    ).outerjoin(
        Attendance,
        and_(
            Attendance.student_id == Student.id,
            Attendance.date == today
        )
    ).filter(Student.is_active == True).order_by(Student.name).all()
    
    attendance_items = []
    for result in results:
        attendance_items.append(TodayAttendanceItem(
            student_id=result.student_id,
            student_name=result.student_name,
            student_grade=result.student_grade,
            attendance_id=result.attendance_id,
            status=result.status,
            time_in=result.time_in,
            time_out=result.time_out,
            note=result.note
        ))
    
    return attendance_items

@router.get("/stats/{student_id}", response_model=AttendanceStats)
def get_attendance_stats(
    student_id: int,
    period: str = Query("monthly", regex="^(weekly|monthly)$", description="Stats period"),
    db: Session = Depends(get_db)
):
    """Get attendance statistics for a student"""
    
    # Check if student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Calculate date range based on period
    end_date = date.today()
    if period == "weekly":
        start_date = end_date - timedelta(weeks=4)  # Last 4 weeks
    else:  # monthly
        start_date = end_date - timedelta(days=90)  # Last 3 months
    
    # Get attendance records for the period
    records = db.query(Attendance).filter(
        and_(
            Attendance.student_id == student_id,
            Attendance.date >= start_date,
            Attendance.date <= end_date
        )
    ).order_by(Attendance.date).all()
    
    # Calculate basic stats
    total_days = len(records)
    status_counts = defaultdict(int)
    for record in records:
        status_counts[record.status] += 1
    
    present_days = status_counts['present']
    absent_days = status_counts['absent']
    late_days = status_counts['late']
    early_leave_days = status_counts['early_leave']
    
    attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0
    
    # Calculate consecutive days
    consecutive_present = 0
    consecutive_absent = 0
    current_present_streak = 0
    current_absent_streak = 0
    
    for record in reversed(records):  # Start from most recent
        if record.status == 'present':
            current_present_streak += 1
            current_absent_streak = 0
        elif record.status == 'absent':
            current_absent_streak += 1
            current_present_streak = 0
        else:
            current_present_streak = 0
            current_absent_streak = 0
        
        consecutive_present = max(consecutive_present, current_present_streak)
        consecutive_absent = max(consecutive_absent, current_absent_streak)
    
    # Generate monthly trend
    monthly_trend = []
    monthly_data = defaultdict(lambda: {'present': 0, 'absent': 0, 'late': 0, 'early_leave': 0})
    
    for record in records:
        month_key = record.date.strftime('%Y-%m')
        monthly_data[month_key][record.status] += 1
    
    for month_key in sorted(monthly_data.keys()):
        data = monthly_data[month_key]
        total_month = sum(data.values())
        rate = (data['present'] / total_month * 100) if total_month > 0 else 0
        
        monthly_trend.append({
            'month': month_key,
            'attendance_rate': round(rate, 1),
            'present': data['present'],
            'absent': data['absent'],
            'late': data['late'],
            'early_leave': data['early_leave']
        })
    
    return AttendanceStats(
        student_id=student_id,
        student_name=student.name,
        total_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        late_days=late_days,
        early_leave_days=early_leave_days,
        attendance_rate=round(attendance_rate, 1),
        consecutive_present=consecutive_present,
        consecutive_absent=consecutive_absent,
        monthly_trend=monthly_trend
    )

@router.post("/bulk", response_model=BulkAttendanceResult)
def bulk_create_attendance(
    bulk_request: BulkAttendanceRequest,
    db: Session = Depends(get_db)
):
    """Bulk create attendance records"""
    
    target_date = bulk_request.date
    results = {
        'success_count': 0,
        'error_count': 0,
        'errors': [],
        'created_attendances': []
    }
    
    for item in bulk_request.attendances:
        try:
            # Check if student exists
            student = db.query(Student).filter(Student.id == item.student_id).first()
            if not student:
                results['errors'].append({
                    'student_id': item.student_id,
                    'error': 'Student not found'
                })
                results['error_count'] += 1
                continue
            
            # Check for duplicate
            existing = db.query(Attendance).filter(
                and_(
                    Attendance.student_id == item.student_id,
                    Attendance.date == target_date
                )
            ).first()
            
            if existing:
                results['errors'].append({
                    'student_id': item.student_id,
                    'error': f'Attendance already exists for {target_date}'
                })
                results['error_count'] += 1
                continue
            
            # Create attendance record
            db_attendance = Attendance(
                student_id=item.student_id,
                date=target_date,
                status=item.status,
                time_in=item.time_in,
                note=item.note
            )
            
            db.add(db_attendance)
            db.commit()
            db.refresh(db_attendance)
            
            results['created_attendances'].append(db_attendance)
            results['success_count'] += 1
            
        except Exception as e:
            db.rollback()
            results['errors'].append({
                'student_id': item.student_id,
                'error': str(e)
            })
            results['error_count'] += 1
    
    return BulkAttendanceResult(**results)