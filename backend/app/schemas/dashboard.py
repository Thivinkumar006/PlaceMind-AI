from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class KPIStats(BaseModel):
    total_students: int
    placed_students: int
    placement_rate: float
    total_companies: int
    active_drives: int

class DepartmentStats(BaseModel):
    name: str
    placed: int
    total: int

class CTCStats(BaseModel):
    name: str
    value: int

class RecentDrive(BaseModel):
    company: str
    role: str
    date: str
    status: str
    selected: str

class DashboardData(BaseModel):
    kpi_stats: KPIStats
    placement_data: List[DepartmentStats]
    ctc_data: List[CTCStats]
    recent_drives: List[RecentDrive]
