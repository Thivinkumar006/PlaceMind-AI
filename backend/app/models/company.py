from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

from sqlalchemy.orm import relationship

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    industry = Column(String, index=True)
    website = Column(String)
    contact_person = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    location = Column(String)
    jd_link = Column(String)
    is_active = Column(Boolean(), default=True)
    status = Column(String, default="COLD") # COLD, HOT, WARM
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    drives = relationship("PlacementDrive", back_populates="company")
