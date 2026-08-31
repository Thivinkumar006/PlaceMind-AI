from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import crud_company
from app.schemas import company as schemas

router = APIRouter()

@router.get("", response_model=schemas.CompanyList, include_in_schema=False)
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

import re
import io
import pandas as pd
from fastapi import File, UploadFile
from fastapi.responses import StreamingResponse
from openpyxl.utils import get_column_letter
from app.models.company import Company

def normalize_column_name(col_name: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', str(col_name).strip().lower())
    return cleaned

EXPECTED_COMPANY_COLUMNS = {
    # Name
    "companyname": "name",
    "company": "name",
    "companies": "name",
    "name": "name",
    "organization": "name",
    "organizationname": "name",
    "org": "name",
    "orgname": "name",
    "employer": "name",
    "firm": "name",
    "firmname": "name",
    "corp": "name",
    "corporation": "name",
    "client": "name",
    # Industry
    "industry": "industry",
    "sector": "industry",
    "domain": "industry",
    "field": "industry",
    "role": "industry",
    "jobrole": "industry",
    "designation": "industry",
    "profile": "industry",
    "position": "industry",
    "jobtitle": "industry",
    "title": "industry",
    "category": "industry",
    # Location
    "location": "location",
    "city": "location",
    "address": "location",
    "worklocation": "location",
    "officelocation": "location",
    "joblocation": "location",
    "postinglocation": "location",
    "place": "location",
    "state": "location",
    "region": "location",
    "headquarters": "location",
    "hq": "location",
    # Contact person
    "contactperson": "contact_person",
    "contactname": "contact_person",
    "hrname": "contact_person",
    "recruiter": "contact_person",
    "pointofcontact": "contact_person",
    "poc": "contact_person",
    "hr": "contact_person",
    "hrperson": "contact_person",
    "contactpersonname": "contact_person",
    "person": "contact_person",
    "representative": "contact_person",
    "contact": "contact_person",
    # Contact email
    "contactemail": "contact_email",
    "email": "contact_email",
    "hremail": "contact_email",
    "mail": "contact_email",
    "emailid": "contact_email",
    "officialemail": "contact_email",
    "mailaddress": "contact_email",
    "contactmail": "contact_email",
    "contactemailid": "contact_email",
    # Contact phone
    "contactphone": "contact_phone",
    "phone": "contact_phone",
    "mobile": "contact_phone",
    "phonenumber": "contact_phone",
    "mobilenumber": "contact_phone",
    "contactnumber": "contact_phone",
    "phoneno": "contact_phone",
    "mobileno": "contact_phone",
    "contactno": "contact_phone",
    "telephone": "contact_phone",
    "cell": "contact_phone",
    "cellphone": "contact_phone",
    "tel": "contact_phone",
    # Website
    "website": "website",
    "url": "website",
    "companywebsite": "website",
    "weblink": "website",
    "site": "website",
    "web": "website",
    "officialwebsite": "website",
    # JD Link
    "jdlink": "jd_link",
    "jd": "jd_link",
    "jobdescription": "jd_link",
    "jobdescriptionlink": "jd_link",
    "careerslink": "jd_link",
    "link": "jd_link",
    "jdurl": "jd_link",
    "joblink": "jd_link",
    "careers": "jd_link",
    "careerurl": "jd_link",
    "jobdescriptionurl": "jd_link",
    "viewjd": "jd_link",
    # Status
    "status": "status",
    "companystatus": "status",
    "stage": "status",
    "hiringstatus": "status",
    "recruitmentstatus": "status",
}

@router.get("/import/template")
async def download_company_template():
    template_columns = [
        "S.No", "Company Name", "Industry", "Location", "Contact Person", 
        "Contact Email", "Contact Phone", "Website", "JD Link", "Status"
    ]
    
    sample_data = [
        [1, "Adobe Systems", "Technical", "Noida, Uttar Pradesh, India", "SURYA", 
         "india-ur@adobe.com", "+91 120 444 4700", "https://adobe.com", "https://careers.adobe.com", "COLD"],
        [2, "Amazon Web Services (AWS)", "Cloud Support Associate", "Bengaluru, Karnataka, India", "RAJESH", 
         "aws-university-in@amazon.com", "+91 80 4103 0001", "https://amazon.jobs", "https://amazon.jobs/aws", "HOT"],
        [3, "Cisco Systems", "Network", "Bengaluru, Karnataka, India", "SUNDAR", 
         "university-hiring@cisco.com", "+91 80 4426 0000", "https://cisco.com", "https://jobs.cisco.com", "HOT"],
        [4, "Cognizant Technology Solutions", "Programmer Analyst Trainee", "Coimbatore / Chennai, India", "BALASUNDRAM", 
         "campusconnection@cognizant.com", "+91 422 664 5000", "https://cognizant.com", "https://careers.cognizant.com", "WARM"],
        [5, "Deloitte USI", "Business Technology Analyst", "Hyderabad / Bengaluru, India", "RANJITH", 
         "usiurrecruiting@deloitte.com", "+91 40 7125 0000", "https://deloitte.com", "https://deloitte.com/careers", "WARM"],
    ]
    
    df = pd.DataFrame(sample_data, columns=template_columns)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Companies', index=False)
        worksheet = writer.sheets['Companies']
        for col_idx, col in enumerate(df.columns, 1):
            max_len = max(
                df[col].astype(str).map(len).max(),
                len(str(col))
            ) + 4
            col_letter = get_column_letter(col_idx)
            worksheet.column_dimensions[col_letter].width = max(max_len, 12)
            
    output.seek(0)
    
    return StreamingResponse(
        output,
        headers={'Content-Disposition': 'attachment; filename="companies_import_template.xlsx"'},
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@router.post("/import/preview", response_model=schemas.CompanyImportPreview)
async def company_import_preview(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Any:
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.")
    
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            # Scan first 20 rows to detect actual header row
            df_test = pd.read_excel(io.BytesIO(contents), header=None)
            best_row_idx = 0
            max_matches = 0
            
            for idx, row in df_test.head(20).iterrows():
                matches = 0
                for col_idx, val in row.items():
                    if pd.isna(val):
                        continue
                    norm_val = normalize_column_name(str(val))
                    if norm_val in EXPECTED_COMPANY_COLUMNS:
                        matches += 1
                if matches > max_matches:
                    max_matches = matches
                    best_row_idx = idx
                    
            if max_matches > 0:
                df = pd.read_excel(io.BytesIO(contents), header=best_row_idx)
            else:
                df = pd.read_excel(io.BytesIO(contents))
                
        df = df.dropna(how='all')
        df = df.astype(object).where(pd.notnull(df), None)
        
        column_mapping = {}
        for col in df.columns:
            norm_col = normalize_column_name(str(col))
            if norm_col in EXPECTED_COMPANY_COLUMNS:
                db_field = EXPECTED_COMPANY_COLUMNS[norm_col]
                column_mapping[str(col)] = db_field
                
        existing_companies = db.query(Company).all()
        existing_names = {c.name.strip().lower(): c for c in existing_companies if c.name}
        
        preview_data = []
        valid_count = 0
        update_count = 0
        error_count = 0
        
        for index, row in df.iterrows():
            row_dict = row.to_dict()
            mapped_data = {}
            for col, db_field in column_mapping.items():
                val = row_dict.get(col)
                if val is not None and not pd.isna(val):
                    if hasattr(val, 'item'):
                        val = val.item()
                    # Format float integers cleanly (e.g. phone numbers or numeric text)
                    if isinstance(val, float) and val.is_integer():
                        val = int(val)
                    mapped_data[db_field] = str(val).strip()
                    
            errors = []
            status = "Valid"
            
            # Required field: name
            company_name = mapped_data.get("name")
            if not company_name or str(company_name).strip() == "" or str(company_name).lower() in ["none", "nan", "null"]:
                errors.append("Missing required field: Company Name")
                status = "Error"
                
            if status == "Error":
                error_count += 1
                preview_data.append(schemas.CompanyImportRow(data=mapped_data, status=status, errors=errors))
                continue
                
            # Normalize status
            comp_status = mapped_data.get("status", "").upper()
            if comp_status not in ["COLD", "WARM", "HOT", "COMPLETED"]:
                # If they wrote "Scheduled" or "Contacted" -> WARM, "Ongoing" -> HOT, "Completed" -> COMPLETED
                if "SCHED" in comp_status or "CONTACT" in comp_status:
                    mapped_data["status"] = "WARM"
                elif "ONGO" in comp_status or "ACTIVE" in comp_status:
                    mapped_data["status"] = "HOT"
                elif "COMPLET" in comp_status:
                    mapped_data["status"] = "COMPLETED"
                else:
                    mapped_data["status"] = "COLD"
            else:
                mapped_data["status"] = comp_status
                
            # Check duplicate / existing
            clean_name = company_name.strip().lower()
            if clean_name in existing_names:
                status = "Update"
                errors.append("Existing company will be updated")
                update_count += 1
            else:
                status = "Valid"
                valid_count += 1
                
            preview_data.append(schemas.CompanyImportRow(data=mapped_data, status=status, errors=errors))
            
        summary = {
            "total": len(preview_data),
            "valid": valid_count,
            "error": error_count,
            "update": update_count,
        }
        
        return schemas.CompanyImportPreview(
            file_name=file.filename,
            summary=summary,
            column_mapping=column_mapping,
            preview_data=preview_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

@router.post("/import/confirm")
async def company_import_confirm(
    payload: schemas.CompanyImportConfirm,
    db: Session = Depends(get_db)
) -> Any:
    imported_count = 0
    updated_count = 0
    errors = []
    
    for index, record in enumerate(payload.records):
        name = str(record.get("name", "")).strip()
        if not name:
            continue
            
        try:
            existing = db.query(Company).filter(Company.name.ilike(name)).first()
            if existing:
                if record.get("industry"): existing.industry = str(record.get("industry")).strip()
                if record.get("location"): existing.location = str(record.get("location")).strip()
                if record.get("contact_person"): existing.contact_person = str(record.get("contact_person")).strip()
                if record.get("contact_email"): existing.contact_email = str(record.get("contact_email")).strip()
                if record.get("contact_phone"): existing.contact_phone = str(record.get("contact_phone")).strip()
                if record.get("website"): existing.website = str(record.get("website")).strip()
                if record.get("jd_link"): existing.jd_link = str(record.get("jd_link")).strip()
                if record.get("status"): existing.status = str(record.get("status")).strip().upper()
                db.add(existing)
                updated_count += 1
            else:
                new_comp = Company(
                    name=name,
                    industry=str(record.get("industry", "")).strip() if record.get("industry") else None,
                    location=str(record.get("location", "")).strip() if record.get("location") else None,
                    contact_person=str(record.get("contact_person", "")).strip() if record.get("contact_person") else None,
                    contact_email=str(record.get("contact_email", "")).strip() if record.get("contact_email") else None,
                    contact_phone=str(record.get("contact_phone", "")).strip() if record.get("contact_phone") else None,
                    website=str(record.get("website", "")).strip() if record.get("website") else None,
                    jd_link=str(record.get("jd_link", "")).strip() if record.get("jd_link") else None,
                    status=str(record.get("status", "COLD")).strip().upper(),
                    is_active=True,
                )
                db.add(new_comp)
                imported_count += 1
        except Exception as e:
            errors.append(f"Row {index+1} ({name}): {str(e)}")
            
    if errors:
        db.rollback()
        raise HTTPException(status_code=400, detail={"message": "Import encountered errors", "errors": errors})
        
    try:
        db.commit()
        return {
            "message": f"Successfully imported {imported_count} new companies and updated {updated_count} companies.",
            "imported": imported_count + updated_count,
            "created": imported_count,
            "updated": updated_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to commit companies: {str(e)}")

@router.post("", response_model=schemas.Company, include_in_schema=False)
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
