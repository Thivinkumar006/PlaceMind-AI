from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from datetime import datetime

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate

class CRUDCompany:
    def get(self, db: Session, id: int) -> Optional[Company]:
        return db.query(Company).filter(Company.id == id).first()

    def get_by_name(self, db: Session, name: str) -> Optional[Company]:
        return db.query(Company).filter(Company.name == name).first()

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        industry: Optional[str] = None,
        is_active: Optional[bool] = None,
        status: Optional[str] = None
    ) -> Tuple[List[Company], int]:
        
        query = db.query(Company)
            
        # Search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Company.name.ilike(search_term),
                    Company.industry.ilike(search_term),
                    Company.contact_person.ilike(search_term),
                    Company.contact_email.ilike(search_term)
                )
            )
            
        # Specific filters
        if industry:
            query = query.filter(Company.industry == industry)
        if is_active is not None:
            query = query.filter(Company.is_active == is_active)
        if status:
            query = query.filter(Company.status == status)
            
        # Total count before pagination
        total = query.count()
        
        # Order by name
        query = query.order_by(Company.name.asc())
        
        # Pagination
        companies = query.offset(skip).limit(limit).all()
        return companies, total

    def create(self, db: Session, *, obj_in: CompanyCreate) -> Company:
        db_obj = Company(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Company, obj_in: CompanyUpdate) -> Company:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> Company:
        db_obj = db.query(Company).filter(Company.id == id).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj
        
company = CRUDCompany()
