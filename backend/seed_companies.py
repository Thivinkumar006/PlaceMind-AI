import os
import sys

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.company import Company
from datetime import datetime

# Mock data for companies
COMPANIES = [
    {
        "name": "Google",
        "industry": "Technology",
        "location": "Mountain View, CA",
        "jd_link": "https://careers.google.com",
        "website": "https://google.com",
        "contact_person": "Sundar Pichai",
        "contact_email": "contact@google.com",
        "contact_phone": "+1 234 567 8900",
        "is_active": True,
        "status": "COLD",
    },
    {
        "name": "Microsoft",
        "industry": "Technology",
        "location": "Redmond, WA",
        "jd_link": "https://careers.microsoft.com",
        "website": "https://microsoft.com",
        "contact_person": "Satya Nadella",
        "contact_email": "contact@microsoft.com",
        "contact_phone": "+1 987 654 3210",
        "is_active": True,
        "status": "HOT",
    },
    {
        "name": "Amazon",
        "industry": "E-commerce",
        "location": "Seattle, WA",
        "jd_link": "https://amazon.jobs",
        "website": "https://amazon.com",
        "contact_person": "Andy Jassy",
        "contact_email": "contact@amazon.com",
        "contact_phone": "+1 555 123 4567",
        "is_active": True,
        "status": "WARM",
    },
    {
        "name": "Goldman Sachs",
        "industry": "Finance",
        "location": "New York, NY",
        "jd_link": "",
        "website": "https://goldmansachs.com",
        "contact_person": "David Solomon",
        "contact_email": "contact@gs.com",
        "contact_phone": "+1 111 222 3333",
        "is_active": False,
        "status": "COLD",
    },
]

def seed_companies(db: Session) -> None:
    for company_data in COMPANIES:
        existing_company = db.query(Company).filter(Company.name == company_data["name"]).first()
        if not existing_company:
            company = Company(**company_data)
            db.add(company)
    
    db.commit()
    print(f"Seeded {len(COMPANIES)} companies.")

if __name__ == "__main__":
    print("Seeding companies...")
    db = SessionLocal()
    try:
        seed_companies(db)
    except Exception as e:
        print(f"Error seeding companies: {e}")
    finally:
        db.close()
    print("Done.")
