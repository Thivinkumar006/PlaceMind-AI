from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

from app import schemas
from app.crud.crud_student import student as crud_student
from app.core.database import get_db

import pandas as pd
import io
import math

router = APIRouter()

@router.get("/", response_model=schemas.StudentList)
def read_students(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    department: Optional[str] = None,
    batch_year: Optional[int] = None,
    placement_status: Optional[str] = None,
    show_deleted: bool = False
) -> Any:
    students, total = crud_student.get_multi(
        db, 
        skip=skip, 
        limit=limit,
        search=search,
        department=department,
        batch_year=batch_year,
        placement_status=placement_status,
        show_deleted=show_deleted
    )
    return {"items": students, "total": total}

@router.post("/", response_model=schemas.Student)
def create_student(
    *,
    db: Session = Depends(get_db),
    student_in: schemas.StudentCreate,
) -> Any:
    student = crud_student.get_by_roll_number(db, roll_number=student_in.roll_number)
    if student:
        raise HTTPException(status_code=400, detail="A student with this roll number already exists.")
    student = crud_student.create(db=db, obj_in=student_in)
    return student

@router.get("/{id}", response_model=schemas.Student)
def read_student(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    student = crud_student.get(db=db, id=id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{id}", response_model=schemas.Student)
def update_student(
    *,
    db: Session = Depends(get_db),
    id: int,
    student_in: schemas.StudentUpdate,
) -> Any:
    student = crud_student.get(db=db, id=id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    # Check roll number uniqueness if updated
    if student_in.roll_number and student_in.roll_number != student.roll_number:
        existing = crud_student.get_by_roll_number(db, roll_number=student_in.roll_number)
        if existing:
            raise HTTPException(status_code=400, detail="A student with this roll number already exists.")
            
    student = crud_student.update(db=db, db_obj=student, obj_in=student_in)
    return student

@router.delete("/{id}", response_model=schemas.Student)
def delete_student(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    student = crud_student.get(db=db, id=id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student = crud_student.soft_delete(db=db, id=id)
    return student

@router.post("/{id}/restore", response_model=schemas.Student)
def restore_student(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    student = crud_student.get(db=db, id=id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student = crud_student.restore(db=db, id=id)
    return student

@router.post("/upload")
async def upload_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Any:
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Replace NaN with None for database compatibility
        df = df.replace({float('nan'): None})
        
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Convert row to dictionary and handle potential mapping issues
                row_dict = row.to_dict()
                
                # Check for existing student
                if "roll_number" not in row_dict or not row_dict["roll_number"]:
                    skipped_count += 1
                    errors.append(f"Row {index + 2}: Missing roll_number")
                    continue
                    
                roll_no = str(row_dict["roll_number"])
                existing = crud_student.get_by_roll_number(db, roll_number=roll_no)
                
                if existing:
                    skipped_count += 1
                    continue
                
                # Prepare student data
                student_data = schemas.StudentCreate(
                    roll_number=roll_no,
                    name=str(row_dict.get("name", "")),
                    department=str(row_dict.get("department", "")),
                    batch_year=int(row_dict.get("batch_year", 0)),
                    gender=str(row_dict.get("gender", "")),
                    is_hosteller=bool(row_dict.get("is_hosteller", False)),
                    
                    sslc_percentage=float(row_dict.get("sslc_percentage", 0.0)),
                    sslc_year=int(row_dict.get("sslc_year", 0)),
                    hsc_percentage=float(row_dict.get("hsc_percentage", 0.0)),
                    hsc_year=int(row_dict.get("hsc_year", 0)),
                    ug_percentage=float(row_dict.get("ug_percentage", 0.0)),
                    ug_year=int(row_dict.get("ug_year", 0)),
                    pg_percentage=float(row_dict.get("pg_percentage")) if row_dict.get("pg_percentage") is not None else None,
                    pg_year=int(row_dict.get("pg_year")) if row_dict.get("pg_year") is not None else None,
                    cgpa=float(row_dict.get("cgpa", 0.0)),
                    
                    email=str(row_dict.get("email", "")),
                    mobile_number=str(row_dict.get("mobile_number", "")),
                    
                    github_link=str(row_dict.get("github_link")) if row_dict.get("github_link") else None,
                    linkedin_link=str(row_dict.get("linkedin_link")) if row_dict.get("linkedin_link") else None,
                    portfolio_link=str(row_dict.get("portfolio_link")) if row_dict.get("portfolio_link") else None,
                    resume_link=str(row_dict.get("resume_link")) if row_dict.get("resume_link") else None,
                    video_link=str(row_dict.get("video_link")) if row_dict.get("video_link") else None,
                    photo_link=str(row_dict.get("photo_link")) if row_dict.get("photo_link") else None,
                    
                    placement_status=str(row_dict.get("placement_status", "Unplaced")),
                    company_name=str(row_dict.get("company_name")) if row_dict.get("company_name") else None,
                    ctc_lpa=float(row_dict.get("ctc_lpa")) if row_dict.get("ctc_lpa") is not None else None,
                )
                
                crud_student.create(db=db, obj_in=student_data)
                imported_count += 1
                
            except Exception as e:
                skipped_count += 1
                errors.append(f"Row {index + 2}: {str(e)}")
                
        return {
            "message": f"Upload complete. Imported: {imported_count}, Skipped: {skipped_count}",
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": errors[:10]  # Return up to 10 errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
