from fastapi import APIRouter
from app.api.v1.endpoints import auth, students, companies, dashboard, drives, ats

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(drives.router, prefix="/drives", tags=["drives"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(ats.router, prefix="/ats", tags=["ats"])

