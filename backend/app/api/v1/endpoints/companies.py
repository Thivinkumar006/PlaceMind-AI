from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import crud_company
from app.schemas import company as schemas

router = APIRouter()

@router.get("/", response_model=schemas.CompanyList)
def read_companies(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    industry: Optional[str] = None,
    is_active: Optional[bool] = None,
    status: Optional[str] = None,
) -> Any:
    """
    Retrieve companies.
    """
    companies, total = crud_company.company.get_multi(
        db,
        skip=skip,
        limit=limit,
        search=search,
        industry=industry,
        is_active=is_active,
        status=status
    )
    return {"items": companies, "total": total}

@router.post("/", response_model=schemas.Company)
def create_company(
    *,
    db: Session = Depends(get_db),
    company_in: schemas.CompanyCreate,
) -> Any:
    """
    Create new company.
    """
    company = crud_company.company.get_by_name(db, name=company_in.name)
    if company:
        raise HTTPException(
            status_code=400,
            detail="The company with this name already exists in the system.",
        )
    company = crud_company.company.create(db, obj_in=company_in)
    return company

@router.put("/{id}", response_model=schemas.Company)
def update_company(
    *,
    db: Session = Depends(get_db),
    id: int,
    company_in: schemas.CompanyUpdate,
) -> Any:
    """
    Update a company.
    """
    company = crud_company.company.get(db, id=id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if company_in.name is not None and company_in.name != company.name:
        company_with_name = crud_company.company.get_by_name(db, name=company_in.name)
        if company_with_name:
            raise HTTPException(
                status_code=400,
                detail="A company with this name already exists in the system.",
            )
            
    company = crud_company.company.update(db, db_obj=company, obj_in=company_in)
    return company

@router.get("/{id}", response_model=schemas.Company)
def read_company(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Get company by ID.
    """
    company = crud_company.company.get(db, id=id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.delete("/{id}", response_model=schemas.Company)
def delete_company(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """
    Delete a company.
    """
    company = crud_company.company.get(db, id=id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company = crud_company.company.delete(db, id=id)
    return company
