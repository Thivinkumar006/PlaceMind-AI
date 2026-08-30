from typing import Optional
from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import datetime

class StudentBase(BaseModel):
    roll_number: str
    name: str
    department: str
    batch_year: int
    gender: str
    is_hosteller: bool = False
    
    sslc_percentage: float
    sslc_year: int
    hsc_percentage: float
    hsc_year: int
    ug_percentage: float
    ug_year: int
    pg_percentage: Optional[float] = None
    pg_year: Optional[int] = None
    cgpa: float
    
    email: EmailStr
    mobile_number: str
    
    github_link: Optional[str] = None
    linkedin_link: Optional[str] = None
    portfolio_link: Optional[str] = None
    resume_link: Optional[str] = None
    video_link: Optional[str] = None
    photo_link: Optional[str] = None
    
    placement_status: Optional[str] = "Unplaced"
    company_name: Optional[str] = None
    ctc_lpa: Optional[float] = None
    is_deleted: bool = False
    upload_batch_id: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    roll_number: Optional[str] = None
    name: Optional[str] = None
    department: Optional[str] = None
    batch_year: Optional[int] = None
    gender: Optional[str] = None
    is_hosteller: Optional[bool] = None
    
    sslc_percentage: Optional[float] = None
    sslc_year: Optional[int] = None
    hsc_percentage: Optional[float] = None
    hsc_year: Optional[int] = None
    ug_percentage: Optional[float] = None
    ug_year: Optional[int] = None
    pg_percentage: Optional[float] = None
    pg_year: Optional[int] = None
    cgpa: Optional[float] = None
    
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = None
    
    github_link: Optional[str] = None
    linkedin_link: Optional[str] = None
    portfolio_link: Optional[str] = None
    resume_link: Optional[str] = None
    video_link: Optional[str] = None
    photo_link: Optional[str] = None
    
    placement_status: Optional[str] = None
    company_name: Optional[str] = None
    ctc_lpa: Optional[float] = None

class StudentInDBBase(StudentBase):
    id: int
    is_deleted: bool
    deleted_at: Optional[datetime]

    class Config:
        orm_mode = True
        from_attributes = True

class Student(StudentInDBBase):
    pass

class StudentList(BaseModel):
    items: list[Student]
    total: int
    stats: Optional[dict] = None

class StudentImportRow(BaseModel):
    data: dict
    status: str  # "Valid", "Error", "Duplicate"
    errors: list[str]

class StudentImportPreview(BaseModel):
    file_name: str
    summary: dict
    column_mapping: dict
    preview_data: list[StudentImportRow]

class StudentImportConfirm(BaseModel):
    records: list[dict]
