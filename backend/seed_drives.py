import os
import sys
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.company import Company
from app.models.placement_drive import PlacementDrive

# Status pipeline:
# Scheduled Drive -> WARM
# Ongoing Drive -> HOT
# Completed Drive -> COMPLETED
SAMPLE_DRIVES = [
    {
        "company_name": "Microsoft",
        "title": "SDE 1 Recruitment",
        "drive_date": datetime(2026, 9, 20, 9, 0, 0),
        "eligibility_criteria": "CGPA > 7.5, All Branches",
        "status": "WARM", # Scheduled == WARM
        "description": "Campus hiring for SDE 1 engineering roles.",
    },
    {
        "company_name": "Google",
        "title": "Software Engineer Fall Hiring",
        "drive_date": datetime(2026, 9, 15, 10, 0, 0),
        "eligibility_criteria": "CGPA > 8.0, CSE/IT",
        "status": "WARM", # Scheduled == WARM
        "description": "Full-time SDE recruitment drive for graduating batch.",
    },
    {
        "company_name": "Amazon",
        "title": "AWS Cloud Engineer Hiring",
        "drive_date": datetime(2026, 8, 25, 11, 0, 0),
        "eligibility_criteria": "CGPA > 7.0, CSE/IT",
        "status": "HOT", # Ongoing == HOT
        "description": "Recruitment drive for Cloud Support and Solutions Architects.",
    },
    {
        "company_name": "Goldman Sachs",
        "title": "Summer Analyst Program",
        "drive_date": datetime(2026, 7, 10, 9, 30, 0),
        "eligibility_criteria": "CGPA > 8.5",
        "status": "COMPLETED", # Completed
        "description": "Internship & analyst recruitment for Quantitative Finance.",
    },
]

def seed_drives(db: Session) -> None:
    for item in SAMPLE_DRIVES:
        comp = db.query(Company).filter(Company.name == item["company_name"]).first()
        if not comp:
            comp = Company(name=item["company_name"], status="WARM")
            db.add(comp)
            db.commit()
            db.refresh(comp)
            
        existing = db.query(PlacementDrive).filter(PlacementDrive.title == item["title"]).first()
        if not existing:
            drive = PlacementDrive(
                company_id=comp.id,
                title=item["title"],
                drive_date=item["drive_date"],
                eligibility_criteria=item["eligibility_criteria"],
                status=item["status"],
                description=item["description"],
            )
            db.add(drive)
        else:
            existing.status = item["status"]
            db.add(existing)
    db.commit()
    print("Drives updated & seeded successfully.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_drives(db)
    finally:
        db.close()
