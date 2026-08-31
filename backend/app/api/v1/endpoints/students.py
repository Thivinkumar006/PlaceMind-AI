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

@router.get("", response_model=schemas.StudentList, include_in_schema=False)
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
    students, total, stats = crud_student.get_multi(
        db, 
        skip=skip, 
        limit=limit,
        search=search,
        department=department,
        batch_year=batch_year,
        placement_status=placement_status,
        show_deleted=show_deleted
    )
    return {"items": students, "total": total, "stats": stats}

@router.post("", response_model=schemas.Student, include_in_schema=False)
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

import re
from fastapi.responses import StreamingResponse

def normalize_column_name(col_name: str) -> str:
    return re.sub(r'[^a-z0-9]', '', str(col_name).lower())

EXPECTED_COLUMNS = {
    "rollno": "roll_number", "rollnumber": "roll_number", "roll": "roll_number", "roll_no": "roll_number",
    "registrationnumber": "roll_number", "regno": "roll_number", "id": "roll_number", "studentid": "roll_number", 
    "name": "name", "studentname": "name", "fullname": "name", "firstname": "name",
    "department": "department", "dept": "department", "branch": "department", "stream": "department", "course": "department", "program": "department", "degree": "department",
    "batchyear": "batch_year", "yearofgraduation": "batch_year", "graduationyear": "batch_year", "batch": "batch_year", "passingyear": "batch_year", "yearofpassing": "batch_year", "yop": "batch_year", "passoutyear": "batch_year", "year": "batch_year", "graduationdate": "batch_year",
    "gender": "gender", "sex": "gender",
    "hostellerdayscholar": "is_hosteller", "hosteller": "is_hosteller", "ishosteller": "is_hosteller",
    "sslc": "sslc_percentage", "sslcpercentage": "sslc_percentage", "10th": "sslc_percentage", "10thpercentage": "sslc_percentage",
    "sslcyear": "sslc_year", "10thyear": "sslc_year",
    "hsc": "hsc_percentage", "hscpercentage": "hsc_percentage", "12th": "hsc_percentage", "12thpercentage": "hsc_percentage",
    "hscyear": "hsc_year", "12thyear": "hsc_year",
    "ug": "ug_percentage", "ugpercentage": "ug_percentage",
    "ugyear": "ug_year",
    "pg": "pg_percentage", "pgpercentage": "pg_percentage",
    "pgyear": "pg_year",
    "cgpa": "cgpa",
    "email": "email", "emailid": "email", "email_id": "email", "emailaddress": "email", "mail": "email", "personalemailid": "email", "collegeemailid": "email",
    "phonenumber": "mobile_number", "phone": "mobile_number", "mobilenumber": "mobile_number", "mobile": "mobile_number", "contact": "mobile_number", "contactnumber": "mobile_number", "contactno": "mobile_number", "mobno": "mobile_number", "whatsapp": "mobile_number", "phoneno": "mobile_number", "mobileno": "mobile_number",
    "githubid": "github_link", "github": "github_link", "githublink": "github_link",
    "linkedinid": "linkedin_link", "linkedin": "linkedin_link", "linkedinlink": "linkedin_link",
    "portfolio": "portfolio_link", "portfoliolink": "portfolio_link",
    "resume": "resume_link", "resumelink": "resume_link",
    "selfintroductionvideolink": "video_link", "video": "video_link", "videolink": "video_link", "introvideo": "video_link",
    "photo": "photo_link", "photolink": "photo_link",
    "placementstatus": "placement_status", "status": "placement_status",
    "companyname": "company_name", "company": "company_name",
    "ctclpa": "ctc_lpa", "ctc": "ctc_lpa", "lpa": "ctc_lpa"
}

@router.post("/import/preview", response_model=schemas.StudentImportPreview)
async def import_preview(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Any:
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    try:
        contents = await file.read()
        
        # DEBUG: Save file to inspect it
        with open("scratch/uploaded.xlsx", "wb") as f:
            f.write(contents)
            
        # Scan first 20 rows to find the actual header row
        df_test = pd.read_excel(io.BytesIO(contents), header=None)
        best_row_idx = 0
        max_matches = 0
        
        for idx, row in df_test.head(20).iterrows():
            matches = 0
            for col_idx, val in row.items():
                if pd.isna(val):
                    continue
                norm_val = normalize_column_name(str(val))
                if norm_val in EXPECTED_COLUMNS:
                    matches += 1
            if matches > max_matches:
                max_matches = matches
                best_row_idx = idx
                
        if max_matches > 0:
            df = pd.read_excel(io.BytesIO(contents), header=best_row_idx)
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        df = df.dropna(how='all')
        
        # Safely convert NaN to None for dict serialization
        df = df.astype(object).where(pd.notnull(df), None)
        
        column_mapping = {}
        mapped_headers = {}
        for col in df.columns:
            norm_col = normalize_column_name(str(col))
            if norm_col in EXPECTED_COLUMNS:
                db_field = EXPECTED_COLUMNS[norm_col]
                column_mapping[col] = db_field
                mapped_headers[db_field] = str(col)
                
        print(f"DEBUG columns: {df.columns.tolist()}")
        print(f"DEBUG column_mapping: {column_mapping}")
        
        preview_data = []
        valid_count = 0
        error_count = 0
        duplicate_count = 0
        
        # Get all existing roll numbers and emails to check duplicates quickly
        from app.models.student import Student
        existing_students = db.query(Student).all()
        existing_rolls = {s.roll_number for s in existing_students}
        existing_emails = {s.email for s in existing_students if s.email}

        for index, row in df.iterrows():
            row_dict = row.to_dict()
            mapped_data = {}
            for col, db_field in column_mapping.items():
                val = row_dict.get(col)
                if val is not None and not pd.isna(val):
                    # Ensure values are native python types, not numpy types
                    if hasattr(val, 'item'):
                        val = val.item()
                    mapped_data[db_field] = val
                    
            if index == 0:
                print(f"DEBUG row 0 mapped_data: {mapped_data}")
                    
            errors = []
            status = "Valid"
            
            # Required fields validation
            required_fields = ["roll_number", "name", "department", "email", "mobile_number", "batch_year"]
            for req in required_fields:
                if not mapped_data.get(req) or str(mapped_data.get(req)).strip() == "":
                    errors.append(f"Missing required field: {req}")
                    status = "Error"
                    
            if status == "Error":
                error_count += 1
                preview_data.append(schemas.StudentImportRow(data=mapped_data, status=status, errors=errors))
                continue
                
            # Duplicate checks
            roll_no = str(mapped_data.get("roll_number")).strip()
            email = str(mapped_data.get("email")).strip()
            
            if roll_no in existing_rolls:
                errors.append("Existing record will be updated")
                status = "Update"
            elif email in existing_emails:
                errors.append("Existing email will be updated")
                status = "Update"
                
            # Validations
            for perc_field in ["sslc_percentage", "hsc_percentage", "ug_percentage", "pg_percentage"]:
                val = mapped_data.get(perc_field)
                if val is not None:
                    try:
                        v = float(val)
                        if v < 0 or v > 100:
                            errors.append(f"{perc_field} must be between 0 and 100")
                            status = "Error"
                        mapped_data[perc_field] = v
                    except ValueError:
                        errors.append(f"Invalid number for {perc_field}")
                        status = "Error"
                        
            if status == "Valid":
                valid_count += 1
            elif status == "Update":
                duplicate_count += 1
            else:
                error_count += 1
                
            preview_data.append(schemas.StudentImportRow(data=mapped_data, status=status, errors=errors))
            
        summary = {
            "total": len(preview_data),
            "valid": valid_count,
            "error": error_count,
            "duplicate": duplicate_count, # keeping key as duplicate for frontend compatibility, but it means updates now
            "update": duplicate_count
        }
        
        return schemas.StudentImportPreview(
            file_name=file.filename,
            summary=summary,
            column_mapping=column_mapping,
            preview_data=preview_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

@router.post("/import/confirm")
async def import_confirm(
    payload: schemas.StudentImportConfirm,
    db: Session = Depends(get_db)
) -> Any:
    imported_count = 0
    errors = []
    student_objs = []
    
    # Pre-fetch existing roll numbers for duplicate checking
    from app.models.student import Student
    existing_students = db.query(Student.roll_number).all()
    existing_rolls = {s[0] for s in existing_students}
    
    for index, record in enumerate(payload.records):
        roll_no = str(record.get("roll_number")).strip()
            
        try:
            # Format specific fields
            student_data = schemas.StudentCreate(
                roll_number=roll_no,
                name=str(record.get("name", "")).strip(),
                department=str(record.get("department", "")).strip(),
                batch_year=int(str(record.get("batch_year", "0"))[:4]) if "-" in str(record.get("batch_year", "")) else int(float(record.get("batch_year", 0))),
                gender=str(record.get("gender", "Not Specified")).strip(),
                is_hosteller=bool(str(record.get("is_hosteller", "")).lower() in ['true', 'yes', '1', 'y']),
                
                sslc_percentage=float(record.get("sslc_percentage", 0.0)),
                sslc_year=int(float(record.get("sslc_year", 0))),
                hsc_percentage=float(record.get("hsc_percentage", 0.0)),
                hsc_year=int(float(record.get("hsc_year", 0))),
                ug_percentage=float(record.get("ug_percentage", 0.0)),
                ug_year=int(float(record.get("ug_year", 0))),
                pg_percentage=float(record.get("pg_percentage")) if record.get("pg_percentage") is not None and str(record.get("pg_percentage")).strip() != "" else None,
                pg_year=int(float(record.get("pg_year"))) if record.get("pg_year") is not None and str(record.get("pg_year")).strip() != "" else None,
                cgpa=float(record.get("cgpa", 0.0)),
                
                email=str(record.get("email", "")).strip(),
                mobile_number=str(record.get("mobile_number", "")).strip(),
                
                github_link=str(record.get("github_link")) if record.get("github_link") else None,
                linkedin_link=str(record.get("linkedin_link")) if record.get("linkedin_link") else None,
                portfolio_link=str(record.get("portfolio_link")) if record.get("portfolio_link") else None,
                resume_link=str(record.get("resume_link")) if record.get("resume_link") else None,
                video_link=str(record.get("video_link")) if record.get("video_link") else None,
                photo_link=str(record.get("photo_link")) if record.get("photo_link") else None,
                
                placement_status=str(record.get("placement_status", "Unplaced")).strip(),
                company_name=str(record.get("company_name")) if record.get("company_name") else None,
                ctc_lpa=float(record.get("ctc_lpa")) if record.get("ctc_lpa") is not None and str(record.get("ctc_lpa")).strip() != "" else None,
            )
            
            existing_student = db.query(Student).filter(Student.roll_number == roll_no).first()
            if existing_student:
                for key, value in student_data.model_dump().items():
                    setattr(existing_student, key, value)
                imported_count += 1
            else:
                db_obj = Student(**student_data.model_dump())
                student_objs.append(db_obj)
        except Exception as e:
            errors.append(f"Row {index+1} error: {str(e)}")
            
    if errors:
        raise HTTPException(status_code=400, detail={"message": "Import failed due to errors", "errors": errors})
        
    try:
        if student_objs:
            db.add_all(student_objs)
            imported_count += len(student_objs)
        db.commit()
            
        return {
            "message": f"Successfully imported {imported_count} students.",
            "imported": imported_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to import records: {str(e)}")

@router.get("/import/template")
async def download_template():
    # Create a template Excel file
    template_columns = [
        "S.No", "Roll No", "Name", "Department", "Gender", "Hosteller/Day Scholar",
        "SSLC %", "SSLC Year", "HSC %", "HSC Year", "UG %", "UG Year", 
        "PG %", "PG Year", "CGPA", "GitHub ID", "LinkedIn ID", "Resume Link", 
        "Self Introduction Video Link", "Photo Link", "Year of Graduation", 
        "Portfolio Link", "Email", "Phone Number", "Placement Status", 
        "Company Name", "CTC (LPA)"
    ]
    
    sample_data = [
        [1, "STU001", "John Doe", "CSE", "Male", "Day Scholar", 
         95.5, 2018, 92.0, 2020, 85.5, 2024, 
         None, None, 8.8, "johndoe_gh", "johndoe_in", "https://link/resume1.pdf", 
         "https://link/video1.mp4", "https://link/photo1.jpg", 2024, 
         "https://johndoe.com", "john@example.com", "9876543210", "Placed", 
         "Tech Corp", 10.5],
        [2, "STU002", "Jane Smith", "IT", "Female", "Hosteller", 
         98.0, 2018, 96.5, 2020, 90.0, 2024, 
         None, None, 9.2, "janesmith_gh", "janesmith_in", "https://link/resume2.pdf", 
         None, None, 2024, 
         None, "jane@example.com", "8765432109", "Unplaced", 
         None, None]
    ]
    
    df = pd.DataFrame(sample_data, columns=template_columns)
    
    # Save to a bytes buffer
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Template', index=False)
        
        # Auto-adjust columns width
        worksheet = writer.sheets['Template']
        for idx, col in enumerate(df):
            series = df[col]
            max_len = max((
                series.astype(str).map(len).max(),
                len(str(series.name))
            )) + 2
            worksheet.set_column(idx, idx, max_len)
            
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="student_import_template.xlsx"'
    }
    
    return StreamingResponse(
        output,
        headers=headers,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
