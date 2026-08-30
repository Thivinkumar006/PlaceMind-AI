from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from typing import List

from app.api import deps
from app.models.student import Student
from app.models.company import Company
from app.models.placement_drive import PlacementDrive
from app.schemas.dashboard import (
    DashboardData, KPIStats, DepartmentStats, CTCStats, RecentDrive
)

router = APIRouter()

@router.get("/stats", response_model=DashboardData)
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    # Require admin role if you have role-based access, 
    # but for now we can just require a valid user
    # current_user = Depends(deps.get_current_active_user) 
):
    # 1. KPI Stats
    total_students = db.query(Student).filter(Student.is_deleted == False).count()
    placed_students = db.query(Student).filter(
        Student.is_deleted == False, 
        Student.placement_status == "Placed"
    ).count()
    
    placement_rate = 0.0
    if total_students > 0:
        placement_rate = round((placed_students / total_students) * 100, 1)
        
    total_companies = db.query(Company).filter(Company.is_active == True).count()
    active_drives = db.query(PlacementDrive).filter(
        PlacementDrive.status.in_(["HOT", "WARM"])
    ).count()
    
    kpi_stats = KPIStats(
        total_students=total_students,
        placed_students=placed_students,
        placement_rate=placement_rate,
        total_companies=total_companies,
        active_drives=active_drives
    )
    
    # 2. Placement by Department
    dept_stats_raw = db.query(
        Student.department,
        func.count(Student.id).label('total'),
        func.sum(
            case((Student.placement_status == 'Placed', 1), else_=0)
        ).label('placed')
    ).filter(Student.is_deleted == False).group_by(Student.department).all()
    
    placement_data = [
        DepartmentStats(
            name=row.department,
            total=row.total,
            placed=row.placed or 0
        ) for row in dept_stats_raw if row.department
    ]
    
    # 3. CTC Distribution
    # For SQLite, doing complex bins in query might be tricky, let's fetch all placed CTCs and bin in Python
    placed_ctcs = db.query(Student.ctc_lpa).filter(
        Student.is_deleted == False,
        Student.placement_status == "Placed",
        Student.ctc_lpa != None
    ).all()
    
    ctc_bins = {
        '2-4 LPA': 0,
        '4-6 LPA': 0,
        '6-8 LPA': 0,
        '8-10 LPA': 0,
        '10+ LPA': 0,
    }
    
    for (ctc,) in placed_ctcs:
        if ctc < 4:
            ctc_bins['2-4 LPA'] += 1
        elif ctc < 6:
            ctc_bins['4-6 LPA'] += 1
        elif ctc < 8:
            ctc_bins['6-8 LPA'] += 1
        elif ctc < 10:
            ctc_bins['8-10 LPA'] += 1
        else:
            ctc_bins['10+ LPA'] += 1
            
    ctc_data = [
        CTCStats(name=k, value=v) for k, v in ctc_bins.items() if v > 0
    ]
    # If no data, add default empty bins so chart doesn't break
    if not ctc_data:
        ctc_data = [CTCStats(name='No Data', value=1)]
        
    # 4. Recent Drives
    recent_drives_query = db.query(PlacementDrive, Company).join(
        Company, PlacementDrive.company_id == Company.id
    ).order_by(desc(PlacementDrive.created_at)).limit(5).all()
    
    recent_drives = []
    for drive, company in recent_drives_query:
        # Format date nicely
        date_str = drive.drive_date.strftime("%d %b %Y") if drive.drive_date else "TBA"
        
        # Count selected (assuming we have a way to know, for now placeholder 0)
        # We would need an Application table to know how many were selected.
        selected_count = "0" 
        
        recent_drives.append(RecentDrive(
            company=company.name,
            role=drive.title,
            date=date_str,
            status=drive.status,
            selected=selected_count
        ))
        
    return DashboardData(
        kpi_stats=kpi_stats,
        placement_data=placement_data,
        ctc_data=ctc_data,
        recent_drives=recent_drives
    )
