from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from datetime import datetime

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate

class CRUDStudent:
    def get(self, db: Session, id: int) -> Optional[Student]:
        return db.query(Student).filter(Student.id == id).first()

    def get_by_roll_number(self, db: Session, roll_number: str) -> Optional[Student]:
        return db.query(Student).filter(Student.roll_number == roll_number).first()

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        department: Optional[str] = None,
        batch_year: Optional[int] = None,
        placement_status: Optional[str] = None,
        show_deleted: bool = False
    ) -> Tuple[List[Student], int]:
        
        query = db.query(Student)
        
        # Soft delete filter
        if not show_deleted:
            query = query.filter(Student.is_deleted == False)
            
        # Search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Student.roll_number.ilike(search_term),
                    Student.name.ilike(search_term),
                    Student.email.ilike(search_term),
                    Student.mobile_number.ilike(search_term)
                )
            )
            
        # Specific filters
        if department:
            query = query.filter(Student.department == department)
        if batch_year:
            query = query.filter(Student.batch_year == batch_year)
        if placement_status:
            query = query.filter(Student.placement_status == placement_status)
            
        # Total count before pagination
        total = query.count()
        
        # Order by deleted (active first) then by name
        query = query.order_by(Student.is_deleted.asc(), Student.name.asc())
        
        # Pagination
        students = query.offset(skip).limit(limit).all()
        return students, total

    def create(self, db: Session, *, obj_in: StudentCreate) -> Student:
        db_obj = Student(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Student, obj_in: StudentUpdate) -> Student:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def soft_delete(self, db: Session, *, id: int) -> Student:
        db_obj = db.query(Student).filter(Student.id == id).first()
        if db_obj:
            db_obj.is_deleted = True
            db_obj.deleted_at = datetime.utcnow()
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj
        
    def restore(self, db: Session, *, id: int) -> Student:
        db_obj = db.query(Student).filter(Student.id == id).first()
        if db_obj:
            db_obj.is_deleted = False
            db_obj.deleted_at = None
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj

student = CRUDStudent()
