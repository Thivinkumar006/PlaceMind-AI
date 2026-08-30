from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PlacementDriveBase(BaseModel):
    company_id: int
    title: str
    description: Optional[str] = None
    drive_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    status: str = "COLD"

class PlacementDriveCreate(PlacementDriveBase):
    pass

class PlacementDriveUpdate(BaseModel):
    company_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    drive_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    status: Optional[str] = None

class PlacementDriveInDBBase(PlacementDriveBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
        from_attributes = True

class PlacementDrive(PlacementDriveInDBBase):
    company_name: Optional[str] = None
    
class PlacementDriveList(BaseModel):
    items: list[PlacementDrive]
    total: int
