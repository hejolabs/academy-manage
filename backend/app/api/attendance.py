from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.attendance import Attendance
from ..schemas.attendance import Attendance as AttendanceSchema, AttendanceCreate, AttendanceUpdate

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.post("/", response_model=AttendanceSchema)
def create_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    db_attendance = Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.get("/", response_model=List[AttendanceSchema])
def read_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    attendance = db.query(Attendance).offset(skip).limit(limit).all()
    return attendance

@router.get("/{attendance_id}", response_model=AttendanceSchema)
def read_attendance_record(attendance_id: int, db: Session = Depends(get_db)):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if attendance is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return attendance

@router.get("/student/{student_id}", response_model=List[AttendanceSchema])
def read_student_attendance(student_id: int, db: Session = Depends(get_db)):
    attendance = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    return attendance

@router.put("/{attendance_id}", response_model=AttendanceSchema)
def update_attendance(attendance_id: int, attendance_update: AttendanceUpdate, db: Session = Depends(get_db)):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if attendance is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    update_data = attendance_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(attendance, field, value)
    
    db.commit()
    db.refresh(attendance)
    return attendance

@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if attendance is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db.delete(attendance)
    db.commit()
    return {"message": "Attendance record deleted successfully"}