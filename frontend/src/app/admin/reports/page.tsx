"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  Users, 
  CheckCircle2, 
  Star, 
  Clock,
  Briefcase,
  Mail,
  Phone,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import * as XLSX from "xlsx";
import StudentForm from "@/components/students/student-form";
import StudentDetails from "@/components/students/student-details";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch report data");
  }
  return res.json();
};

type TabType = "all" | "selected" | "shortlisted" | "ytbp";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination & Filters for "All Students" tab
  const [page, setPage] = useState(1);
  const limit = 10;
  const skip = (page - 1) * limit;
  const [filters, setFilters] = useState({
    department: "",
    placement_status: "",
    show_deleted: false,
  });

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
    ...(searchQuery && { search: searchQuery }),
    ...(filters.department && { department: filters.department }),
    ...(filters.placement_status && { placement_status: filters.placement_status }),
    ...(filters.show_deleted && { show_deleted: "true" })
  });

  // Fetch paginated data for All Students tab
  const { data: paginatedData, error: paginatedError, isLoading: isPaginatedLoading, mutate: mutatePaginated } = useSWR(
    `${API_BASE_URL}/students/?${queryParams.toString()}`,
    fetcher
  );
  
  // Fetch all data for other tabs & summary calculations
  const { data: allData, error: allError, isLoading: isAllLoading, mutate: mutateAll } = useSWR(
    `${API_BASE_URL}/students/?limit=10000`,
    fetcher
  );

  const paginatedStudents = Array.isArray(paginatedData?.items) ? paginatedData.items : [];
  const total = paginatedData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const allStudents = Array.isArray(allData?.items) ? allData.items : [];
  const stats = paginatedData?.stats || allData?.stats || {};

  const isStatus = (s: any, status: string) => {
    return s.placement_status?.toString().trim().toLowerCase() === status.toLowerCase();
  };

  const selectedStudents = allStudents.filter((s: any) => isStatus(s, "Placed"));
  const shortlistedStudents = allStudents.filter((s: any) => isStatus(s, "Shortlisted"));
  const ytbpStudents = allStudents.filter(
    (s: any) => isStatus(s, "Unplaced") || isStatus(s, "YET_TO_BE_PLACED") || !s.placement_status
  );

  const filterBySearchAndDept = (student: any) => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = student.name?.toLowerCase().includes(q);
    const rollMatch = student.roll_number?.toLowerCase().includes(q);
    const deptMatch = student.department?.toLowerCase().includes(q);
    const companyMatch = student.company_name?.toLowerCase().includes(q);

    const matchesSearch = !q || nameMatch || rollMatch || deptMatch || companyMatch;
    const matchesDept = !filters.department || student.department === filters.department;

    return matchesSearch && matchesDept;
  };

  const filteredSelected = selectedStudents.filter(filterBySearchAndDept);
  const filteredShortlisted = shortlistedStudents.filter(filterBySearchAndDept);
  const filteredYtbp = ytbpStudents.filter(filterBySearchAndDept);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [modalState, setModalState] = useState<"none" | "edit" | "details" | "delete" | "restore">("none");

  const refreshData = () => {
    mutatePaginated();
    mutateAll();
  };

  const handleExportAll = () => {
    if (allStudents.length === 0) {
      alert("No student data to export.");
      return;
    }
    const exportData = allStudents.map((s: any, idx: number) => ({
      "S.No": idx + 1,
      "Roll Number": s.roll_number,
      "Full Name": s.name,
      "Department": s.department,
      "Batch Year": s.batch_year,
      "Gender": s.gender,
      "CGPA": s.cgpa,
      "SSLC %": s.sslc_percentage,
      "HSC %": s.hsc_percentage,
      "UG %": s.ug_percentage,
      "Placement Status": s.placement_status,
      "Company Name": s.company_name || "",
      "Package CTC (LPA)": s.ctc_lpa || "",
      "Email Address": s.email,
      "Phone Number": s.mobile_number,
      "GitHub": s.github_link || "",
      "LinkedIn": s.linkedin_link || "",
      "Portfolio": s.portfolio_link || "",
      "Resume": s.resume_link || ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placement Reports");
    XLSX.writeFile(wb, "placement_portal_master_report.xlsx");
  };

  const handleExportTab = (tabName: string, dataList: any[]) => {
    if (dataList.length === 0) {
      alert(`No data available in ${tabName} to export.`);
      return;
    }
    const exportData = dataList.map((s: any, idx: number) => ({
      "S.No": idx + 1,
      "Roll Number": s.roll_number,
      "Full Name": s.name,
      "Department": s.department,
      "Batch Year": s.batch_year,
      "CGPA": s.cgpa,
      "Placement Status": s.placement_status,
      "Company Name": s.company_name || "",
      "CTC (LPA)": s.ctc_lpa || "",
      "Email": s.email,
      "Phone": s.mobile_number,
      "Resume": s.resume_link || ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tabName);
    XLSX.writeFile(wb, `${tabName.toLowerCase()}_students_report.xlsx`);
  };

  const handleAction = async (action: "delete" | "restore", id: number) => {
    try {
      await fetch(`${API_BASE_URL}/students/${id}${action === "restore" ? "/restore" : ""}`, {
        method: action === "delete" ? "DELETE" : "POST"
      });
      refreshData();
      setModalState("none");
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} student.`);
    }
  };

  const hasError = paginatedError || allError;
  const isLoading = isPaginatedLoading && isAllLoading;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            Placement Reports & Analytics
          </h2>
          <p className="text-slate-500 mt-1">
            Detailed breakdown of student placement statuses, offers, and talent pool.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            className="border-slate-300 gap-1.5"
            onClick={() => {
              if (activeTab === "all") handleExportAll();
              else if (activeTab === "selected") handleExportTab("Placed_Students", filteredSelected);
              else if (activeTab === "shortlisted") handleExportTab("Shortlisted_Candidates", filteredShortlisted);
              else handleExportTab("YTBP_Candidates", filteredYtbp);
            }}
          >
            <Download className="h-4 w-4" /> Export {activeTab === "all" ? "Full Report" : "Current View"}
          </Button>

          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2" 
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4" /> Export Master Excel
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className={cn(
            "bg-white border-slate-200 shadow-sm cursor-pointer transition-all hover:border-blue-400 hover:shadow-md",
            activeTab === "all" && "ring-2 ring-blue-500 border-blue-500"
          )} 
          onClick={() => { setActiveTab("all"); setPage(1); }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Pool</p>
              <p className="text-3xl font-bold text-slate-900">{allStudents.length || total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "bg-white border-slate-200 shadow-sm cursor-pointer transition-all hover:border-emerald-400 hover:shadow-md",
            activeTab === "selected" && "ring-2 ring-emerald-500 border-emerald-500"
          )} 
          onClick={() => setActiveTab("selected")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Selected (Placed)</p>
              <p className="text-3xl font-bold text-emerald-600">{selectedStudents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "bg-white border-slate-200 shadow-sm cursor-pointer transition-all hover:border-amber-400 hover:shadow-md",
            activeTab === "shortlisted" && "ring-2 ring-amber-500 border-amber-500"
          )} 
          onClick={() => setActiveTab("shortlisted")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Shortlisted</p>
              <p className="text-3xl font-bold text-amber-600">{shortlistedStudents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "bg-white border-slate-200 shadow-sm cursor-pointer transition-all hover:border-slate-400 hover:shadow-md",
            activeTab === "ytbp" && "ring-2 ring-slate-500 border-slate-500"
          )} 
          onClick={() => setActiveTab("ytbp")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Yet To Be Placed</p>
              <p className="text-3xl font-bold text-slate-700">{ytbpStudents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-200/60 p-1.5 rounded-xl w-full">
        {/* Custom Tabs */}
        <div className="flex space-x-1 overflow-x-auto w-full lg:w-auto">
          <button
            onClick={() => { setActiveTab("all"); setPage(1); }}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap",
              activeTab === "all" 
                ? "bg-white text-blue-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            )}
          >
            All Students ({allStudents.length || total})
          </button>
          <button
            onClick={() => setActiveTab("selected")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap",
              activeTab === "selected" 
                ? "bg-white text-emerald-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            )}
          >
            Selected ({filteredSelected.length})
          </button>
          <button
            onClick={() => setActiveTab("shortlisted")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap",
              activeTab === "shortlisted" 
                ? "bg-white text-amber-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            )}
          >
            Shortlisted ({filteredShortlisted.length})
          </button>
          <button
            onClick={() => setActiveTab("ytbp")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap",
              activeTab === "ytbp" 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
            )}
          >
            YTBP Pool ({filteredYtbp.length})
          </button>
        </div>

        {/* Global Search Bar & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pr-1">
          <div className="relative flex-grow lg:flex-grow-0 lg:w-[260px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Search reports..." 
              className="w-full pl-9 bg-white border-none shadow-sm h-10 text-sm" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab === "all") setPage(1);
              }}
            />
          </div>
          
          <select 
            className="h-10 rounded-md border-none bg-white shadow-sm px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
            value={filters.department}
            onChange={(e) => { 
              setFilters({...filters, department: e.target.value}); 
              if (activeTab === "all") setPage(1); 
            }}
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          {activeTab === "all" && (
            <>
              <select 
                className="h-10 rounded-md border-none bg-white shadow-sm px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500"
                value={filters.placement_status}
                onChange={(e) => { setFilters({...filters, placement_status: e.target.value}); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Unplaced">Unplaced</option>
              </select>

              <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 bg-white h-10 px-3 rounded-md shadow-sm cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-600"
                  checked={filters.show_deleted}
                  onChange={(e) => { setFilters({...filters, show_deleted: e.target.checked}); setPage(1); }}
                />
                <span>Show Deleted</span>
              </label>
            </>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 bg-white shadow-sm text-slate-600 hover:text-slate-900"
            onClick={refreshData}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Table Card */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
            <span>
              {activeTab === "all" && "All Students Record"}
              {activeTab === "selected" && "Selected Students Roster (Placed Candidates)"}
              {activeTab === "shortlisted" && "Shortlisted Candidates Pipeline"}
              {activeTab === "ytbp" && "Yet To Be Placed (Active Talent Pool)"}
            </span>
            <span className="text-xs font-normal text-slate-500">
              {activeTab === "all" ? `${total} students total` : `${
                activeTab === "selected" ? filteredSelected.length :
                activeTab === "shortlisted" ? filteredShortlisted.length :
                filteredYtbp.length
              } candidate(s)`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  {activeTab === "all" ? (
                    <>
                      <th className="px-4 py-3.5 font-medium">S/NO</th>
                      <th className="px-4 py-3.5 font-medium">Roll No</th>
                      <th className="px-4 py-3.5 font-medium">Student Name</th>
                      <th className="px-4 py-3.5 font-medium">Dept & Batch</th>
                      <th className="px-4 py-3.5 font-medium">CGPA</th>
                      <th className="px-4 py-3.5 font-medium">Status</th>
                      <th className="px-4 py-3.5 font-medium">Company / CTC</th>
                      <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3.5 font-medium">Student Details</th>
                      <th className="px-6 py-3.5 font-medium">Contact</th>
                      {activeTab === "selected" && (
                        <>
                          <th className="px-6 py-3.5 font-medium">Placed At Company</th>
                          <th className="px-6 py-3.5 font-medium">Package (CTC)</th>
                        </>
                      )}
                      {activeTab === "shortlisted" && (
                        <>
                          <th className="px-6 py-3.5 font-medium">Shortlisted For</th>
                          <th className="px-6 py-3.5 font-medium">CGPA & Dept</th>
                        </>
                      )}
                      {activeTab === "ytbp" && (
                        <>
                          <th className="px-6 py-3.5 font-medium">Academics (CGPA / Dept)</th>
                          <th className="px-6 py-3.5 font-medium">Portfolios & Links</th>
                        </>
                      )}
                      <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                        <p className="text-sm">Loading report data...</p>
                      </div>
                    </td>
                  </tr>
                ) : hasError ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-red-500">
                      <p className="font-semibold">Failed to load reports.</p>
                      <p className="text-xs mt-1 text-slate-500">Ensure the backend server is running and accessible.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={refreshData}>
                        Retry Fetching
                      </Button>
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* ALL STUDENTS TAB */}
                    {activeTab === "all" && paginatedStudents.map((student: any, index: number) => {
                      const isPlaced = isStatus(student, "Placed");
                      const isShortlisted = isStatus(student, "Shortlisted");
                      return (
                        <tr 
                          key={student.id} 
                          className={`hover:bg-slate-50/70 transition-colors ${student.is_deleted ? 'opacity-60 bg-red-50/20' : ''}`}
                        >
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{skip + index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 font-mono text-xs">{student.roll_number}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 text-sm">
                              {student.name}
                              {student.is_deleted && (
                                <span className="ml-2 text-xs font-normal text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                  Deleted
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{student.email}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">
                            {student.department} <span className="text-slate-400 text-xs font-normal">({student.batch_year})</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-700">
                            <span className="bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">{student.cgpa}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isPlaced ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                              isShortlisted ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}>
                              {student.placement_status || "Unplaced"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {student.company_name ? (
                              <div>
                                <span className="font-semibold text-slate-800">{student.company_name}</span>
                                {student.ctc_lpa && (
                                  <span className="ml-1 text-emerald-600 font-bold">({student.ctc_lpa} LPA)</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50" 
                                onClick={() => { setSelectedStudent(student); setModalState("details"); }}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-600 hover:bg-slate-100" 
                                onClick={() => { setSelectedStudent(student); setModalState("edit"); }}
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {student.is_deleted ? (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" 
                                  onClick={() => { setSelectedStudent(student); setModalState("restore"); }}
                                  title="Restore"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500 hover:bg-red-50" 
                                  onClick={() => { setSelectedStudent(student); setModalState("delete"); }}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {activeTab === "all" && paginatedStudents.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Users className="h-8 w-8 text-slate-300" />
                            <p className="font-semibold text-slate-700">No student records found</p>
                            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* SELECTED TAB */}
                    {activeTab === "selected" && filteredSelected.map((student: any) => (
                      <tr key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              {student.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{student.name}</div>
                              <div className="text-xs text-slate-500">{student.roll_number} • {student.department} • CGPA: {student.cgpa}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex flex-col text-xs gap-1">
                            <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {student.email}</div>
                            {student.mobile_number && (
                              <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {student.mobile_number}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-900">{student.company_name || "Company Assigned"}</div>
                              <div className="text-xs text-slate-500">Batch {student.batch_year}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs">
                            {student.ctc_lpa ? `${student.ctc_lpa} LPA` : "Not specified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8 gap-1 border-slate-200"
                            onClick={() => { setSelectedStudent(student); setModalState("details"); }}
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" /> View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {/* SHORTLISTED TAB */}
                    {activeTab === "shortlisted" && filteredShortlisted.map((student: any) => (
                      <tr key={student.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                              {student.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{student.name}</div>
                              <div className="text-xs text-slate-500">{student.roll_number} • {student.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex flex-col text-xs gap-1">
                            <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {student.email}</div>
                            {student.mobile_number && (
                              <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {student.mobile_number}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{student.company_name || "Drive in Progress"}</div>
                          <div className="text-xs text-slate-500">Shortlisted for Placement</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-semibold border border-amber-200">
                            CGPA: {student.cgpa}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8 gap-1 border-slate-200"
                            onClick={() => { setSelectedStudent(student); setModalState("details"); }}
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" /> View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {/* YTBP TAB */}
                    {activeTab === "ytbp" && filteredYtbp.map((student: any) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                              {student.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{student.name}</div>
                              <div className="text-xs text-slate-500">{student.roll_number} • Batch {student.batch_year}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex flex-col text-xs gap-1">
                            <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {student.email}</div>
                            {student.mobile_number && (
                              <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {student.mobile_number}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{student.department}</div>
                          <div className="text-xs text-blue-600 font-semibold">CGPA: {student.cgpa}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {student.resume_link && (
                              <a 
                                href={student.resume_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              >
                                Resume <ExternalLink className="ml-1 h-2.5 w-2.5" />
                              </a>
                            )}
                            {student.github_link && (
                              <a 
                                href={student.github_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                              >
                                GitHub <ExternalLink className="ml-1 h-2.5 w-2.5" />
                              </a>
                            )}
                            {student.linkedin_link && (
                              <a 
                                href={student.linkedin_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                              >
                                LinkedIn <ExternalLink className="ml-1 h-2.5 w-2.5" />
                              </a>
                            )}
                            {!student.resume_link && !student.github_link && !student.linkedin_link && (
                              <span className="text-xs text-slate-400 italic">No links attached</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8 gap-1 border-slate-200"
                            onClick={() => { setSelectedStudent(student); setModalState("details"); }}
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" /> View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {/* Empty State for other tabs */}
                    {((activeTab === "selected" && filteredSelected.length === 0) ||
                      (activeTab === "shortlisted" && filteredShortlisted.length === 0) ||
                      (activeTab === "ytbp" && filteredYtbp.length === 0)) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <Users className="h-8 w-8 text-slate-300" />
                            <p className="font-semibold text-slate-700">No candidates in this category</p>
                            <p className="text-xs text-slate-500">No records match your selected tab and search filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination for All Students */}
          {activeTab === "all" && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
              <div className="text-xs text-slate-500">
                Showing <span className="font-medium">{skip + 1}</span> to{" "}
                <span className="font-medium">{Math.min(skip + limit, total)}</span> of{" "}
                <span className="font-medium">{total}</span> entries
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="text-xs font-semibold text-slate-700 px-2">
                  Page {page} of {Math.max(1, totalPages)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page >= totalPages || total === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {modalState === "edit" && (
        <StudentForm 
          student={selectedStudent} 
          onClose={() => { setModalState("none"); refreshData(); }} 
        />
      )}

      {modalState === "details" && selectedStudent && (
        <StudentDetails student={selectedStudent} onClose={() => setModalState("none")} />
      )}

      {(modalState === "delete" || modalState === "restore") && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Confirm {modalState === "delete" ? "Deletion" : "Restoration"}</h3>
              <p className="text-slate-600 mb-6 text-sm">
                Are you sure you want to {modalState === "delete" ? "delete" : "restore"} student{" "}
                <strong>{selectedStudent.name}</strong> ({selectedStudent.roll_number})?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setModalState("none")}>Cancel</Button>
                <Button 
                  variant="default" 
                  className={modalState === "delete" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                  onClick={() => handleAction(modalState, selectedStudent.id)}
                >
                  Confirm {modalState === "delete" ? "Delete" : "Restore"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
