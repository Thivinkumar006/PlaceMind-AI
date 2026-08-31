from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PlacementDriveBase(BaseModel):
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    drive_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    status: str = "WARM"

class PlacementDriveCreate(PlacementDriveBase):
    pass

class PlacementDriveUpdate(BaseModel):
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    drive_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    status: Optional[str] = None

class PlacementDriveInDBBase(PlacementDriveBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PlacementDrive(PlacementDriveInDBBase):
    company_name: Optional[str] = None
    
class PlacementDriveList(BaseModel):
    items: list[PlacementDrive]
    total: int
