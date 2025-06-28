from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.connection import engine
from .database.base import Base
from .api import students, attendance, payments

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Study Room Management System",
    description="API for managing study room students, attendance, and payments",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Study Room Management System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}