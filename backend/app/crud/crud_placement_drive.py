from typing import Any, Dict, Optional, Union, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.placement_drive import PlacementDrive
from app.models.company import Company
from app.schemas.placement_drive import PlacementDriveCreate, PlacementDriveUpdate

class CRUDPlacementDrive(CRUDBase[PlacementDrive, PlacementDriveCreate, PlacementDriveUpdate]):
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[List[PlacementDrive], int]:
        query = db.query(self.model)
        
        if search:
            search = f"%{search}%"
            # Join with company to search by company name as well
            query = query.join(Company).filter(
                or_(
                    self.model.title.ilike(search),
                    Company.name.ilike(search)
                )
            )
            
        if status:
            query = query.filter(self.model.status == status)
            
        total = query.count()
        drives = query.order_by(self.model.drive_date.desc()).offset(skip).limit(limit).all()
        
        # Populate company_name for the response
        for drive in drives:
            drive.company_name = drive.company.name if drive.company else None
            
        return drives, total

placement_drive = CRUDPlacementDrive(PlacementDrive)
