from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class PlacementDrive(Base):
    __tablename__ = "placement_drives"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    drive_date = Column(DateTime(timezone=True))
    eligibility_criteria = Column(Text)
    status = Column(String, default="COLD") # COLD, HOT, WARM
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Assuming we will want to access the company from a drive
    # company = relationship("Company", back_populates="drives")
