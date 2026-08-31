from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import crud_placement_drive, crud_company
from app.models.company import Company
from app.models.placement_drive import PlacementDrive
from app.schemas import placement_drive as schemas

router = APIRouter()

@router.get("", response_model=schemas.PlacementDriveList, include_in_schema=False)
@router.get("/", response_model=schemas.PlacementDriveList)
def read_drives(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
) -> Any:
    """
    Retrieve placement drives.
    """
    drives, total = crud_placement_drive.placement_drive.get_multi(
        db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
    )
    return {"items": drives, "total": total}

@router.post("", response_model=schemas.PlacementDrive, include_in_schema=False)
@router.post("/", response_model=schemas.PlacementDrive)
def create_drive(
    *,
    db: Session = Depends(get_db),
    drive_in: schemas.PlacementDriveCreate,
) -> Any:
    """
    Create new placement drive.
    """
    company_id = drive_in.company_id

    # If company_name is given and company_id is not given
    if (not company_id or company_id == 0) and drive_in.company_name:
        clean_name = drive_in.company_name.strip()
        existing_company = crud_company.company.get_by_name(db, name=clean_name)
        if existing_company:
            company_id = existing_company.id
            if existing_company.status == "COLD":
                existing_company.status = drive_in.status or "WARM"
                db.add(existing_company)
        else:
            new_comp = Company(name=clean_name, status=drive_in.status or "WARM")
            db.add(new_comp)
            db.commit()
            db.refresh(new_comp)
            company_id = new_comp.id

    if not company_id:
        # Check if at least one default company exists
        first_comp = db.query(Company).first()
        if first_comp:
            company_id = first_comp.id
        else:
            new_comp = Company(name=drive_in.company_name or "General", status=drive_in.status or "WARM")
            db.add(new_comp)
            db.commit()
            db.refresh(new_comp)
            company_id = new_comp.id
    else:
        # Update existing company status from COLD to WARM/HOT if drive is scheduled/ongoing
        comp = db.query(Company).filter(Company.id == company_id).first()
        if comp and comp.status == "COLD":
            comp.status = drive_in.status or "WARM"
            db.add(comp)

    drive_data = drive_in.model_dump(exclude={"company_name"})
    drive_data["company_id"] = company_id
    if not drive_data.get("status"):
        drive_data["status"] = "WARM"
    
    db_obj = PlacementDrive(**drive_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Populate company_name
    db_obj.company_name = db_obj.company.name if db_obj.company else ""
    return db_obj

@router.get("/{id}", response_model=schemas.PlacementDrive)
def read_drive(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Get placement drive by ID.
    """
    drive = crud_placement_drive.placement_drive.get(db, id=id)
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")
    drive.company_name = drive.company.name if drive.company else ""
    return drive

@router.put("/{id}", response_model=schemas.PlacementDrive)
def update_drive(
    *,
    db: Session = Depends(get_db),
    id: int,
    drive_in: schemas.PlacementDriveUpdate,
) -> Any:
    """
    Update a placement drive.
    """
    drive = crud_placement_drive.placement_drive.get(db, id=id)
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")
    
    update_data = drive_in.model_dump(exclude_unset=True)
    
    # Check if company_name needs resolution
    if "company_name" in update_data and update_data["company_name"]:
        clean_name = update_data["company_name"].strip()
        existing_company = crud_company.company.get_by_name(db, name=clean_name)
        if existing_company:
            update_data["company_id"] = existing_company.id
        else:
            new_comp = Company(name=clean_name, status="COLD")
            db.add(new_comp)
            db.commit()
            db.refresh(new_comp)
            update_data["company_id"] = new_comp.id
            
    if "company_name" in update_data:
        del update_data["company_name"]
        
    for field, value in update_data.items():
        setattr(drive, field, value)
        
    db.add(drive)
    db.commit()
    db.refresh(drive)
    drive.company_name = drive.company.name if drive.company else ""
    return drive

@router.delete("/{id}", response_model=schemas.PlacementDrive)
def delete_drive(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Delete a placement drive.
    """
    drive = crud_placement_drive.placement_drive.get(db, id=id)
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")
    
    company_name = drive.company.name if drive.company else ""
    db.delete(drive)
    db.commit()
    drive.company_name = company_name
    return drive
