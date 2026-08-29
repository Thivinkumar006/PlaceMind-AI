from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.core.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    batch_year = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    is_hosteller = Column(Boolean, default=False)
    
    sslc_percentage = Column(Float, nullable=False)
    sslc_year = Column(Integer, nullable=False)
    hsc_percentage = Column(Float, nullable=False)
    hsc_year = Column(Integer, nullable=False)
    ug_percentage = Column(Float, nullable=False)
    ug_year = Column(Integer, nullable=False)
    pg_percentage = Column(Float, nullable=True)
    pg_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=False)
    
    email = Column(String, index=True, nullable=False)
    mobile_number = Column(String, nullable=False)
    
    github_link = Column(String, nullable=True)
    linkedin_link = Column(String, nullable=True)
    portfolio_link = Column(String, nullable=True)
    resume_link = Column(String, nullable=True)
    video_link = Column(String, nullable=True)
    photo_link = Column(String, nullable=True)
    
    placement_status = Column(String, default="Unplaced")
    company_name = Column(String, nullable=True)
    ctc_lpa = Column(Float, nullable=True)
    
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
