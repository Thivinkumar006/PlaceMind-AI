from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.placement_drive import PlacementDrive
from app.models.company import Company
from app.schemas.placement_drive import PlacementDriveCreate, PlacementDriveUpdate

class CRUDPlacementDrive:
    def get(self, db: Session, id: int) -> Optional[PlacementDrive]:
        return db.query(PlacementDrive).filter(PlacementDrive.id == id).first()

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[List[PlacementDrive], int]:
        query = db.query(PlacementDrive).outerjoin(Company, PlacementDrive.company_id == Company.id)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    PlacementDrive.title.ilike(search_pattern),
                    Company.name.ilike(search_pattern),
                    PlacementDrive.eligibility_criteria.ilike(search_pattern)
                )
            )
            
        if status:
            query = query.filter(PlacementDrive.status == status)
            
        total = query.count()
        drives = query.order_by(PlacementDrive.drive_date.desc()).offset(skip).limit(limit).all()
        
        # Populate company_name for response
        for drive in drives:
            drive.company_name = drive.company.name if drive.company else ""
            
        return drives, total

    def create(self, db: Session, *, obj_in: PlacementDriveCreate) -> PlacementDrive:
        data = obj_in.model_dump(exclude={"company_name"})
        db_obj = PlacementDrive(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        db_obj.company_name = db_obj.company.name if db_obj.company else ""
        return db_obj

    def update(self, db: Session, *, db_obj: PlacementDrive, obj_in: PlacementDriveUpdate) -> PlacementDrive:
        update_data = obj_in.model_dump(exclude_unset=True, exclude={"company_name"})
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        db_obj.company_name = db_obj.company.name if db_obj.company else ""
        return db_obj

    def delete(self, db: Session, *, id: int) -> Optional[PlacementDrive]:
        db_obj = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
        if db_obj:
            company_name = db_obj.company.name if db_obj.company else ""
            db.delete(db_obj)
            db.commit()
            db_obj.company_name = company_name
        return db_obj

placement_drive = CRUDPlacementDrive()
