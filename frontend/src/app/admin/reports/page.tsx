"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import * as XLSX from "xlsx";
import StudentForm from "@/components/students/student-form";
import StudentDetails from "@/components/students/student-details";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const { data: paginatedData, error, mutate } = useSWR(`${API_BASE_URL}/students/?${queryParams.toString()}`, fetcher);
  
  // Fetch all data for other tabs stats (in a real app, you'd use dedicated aggregation endpoints)
  const { data: allData } = useSWR(`${API_BASE_URL}/students/?limit=10000`, fetcher);
  
  const allStudents = allData?.items || [];
  const paginatedStudents = paginatedData?.items || [];
  const total = paginatedData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const selectedStudents = allStudents.filter((s: any) => s.placement_status === "Placed");
  const shortlistedStudents = allStudents.filter((s: any) => s.placement_status === "Shortlisted");
  const ytbpStudents = allStudents.filter((s: any) => s.placement_status === "Unplaced" || s.placement_status === "YET_TO_BE_PLACED");

  const filterByNameOrBranch = (student: any) => {
    const nameMatch = student.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const branchMatch = student.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || branchMatch;
  };

  const filteredSelected = selectedStudents.filter(filterByNameOrBranch);
  const filteredShortlisted = shortlistedStudents.filter(filterByNameOrBranch);
  const filteredYtbp = ytbpStudents.filter(filterByNameOrBranch);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [modalState, setModalState] = useState<"none" | "edit" | "details" | "delete" | "restore">("none");

  const handleExportAll = () => {
    const ws = XLSX.utils.json_to_sheet(allStudents);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "all_students_report.xlsx");
  };

  const handleAction = async (action: "delete" | "restore", id: number) => {
    try {
      await fetch(`${API_BASE_URL}/students/${id}${action === "restore" ? "/restore" : ""}`, {
        method: action === "delete" ? "DELETE" : "POST"
      });
      mutate();
      setModalState("none");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Placement Reports</h2>
          <p className="text-slate-500 mt-1">Detailed breakdown of student placement statuses.</p>
        </div>
        
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2" onClick={handleExportAll}>
          <Download className="h-4 w-4" /> Export Full Report
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
        <Card className="bg-white border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab("all")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <p className="text-3xl font-bold text-slate-900">{allData?.total || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab("selected")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Selected</p>
              <p className="text-3xl font-bold text-slate-900">{selectedStudents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setActiveTab("shortlisted")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Shortlisted</p>
              <p className="text-3xl font-bold text-slate-900">{shortlistedStudents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm cursor-pointer hover:border-slate-400 transition-colors" onClick={() => setActiveTab("ytbp")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">YTBP (Unplaced)</p>
              <p className="text-3xl font-bold text-slate-900">{ytbpStudents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-200/50 p-1 rounded-lg w-full">
        {/* Custom Tabs */}
        <div className="flex space-x-1 overflow-x-auto w-full xl:w-auto">
          <button
            onClick={() => { setActiveTab("all"); setPage(1); }}
            className={cn(
              "px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "all" ? "bg-white text-blue-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
            )}
          >
            All Students ({allData?.total || 0})
          </button>
          <button
            onClick={() => setActiveTab("selected")}
            className={cn(
              "px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "selected" ? "bg-white text-emerald-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
            )}
          >
            Selected ({filteredSelected.length})
          </button>
          <button
            onClick={() => setActiveTab("shortlisted")}
            className={cn(
              "px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "shortlisted" ? "bg-white text-amber-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
            )}
          >
            Shortlisted ({filteredShortlisted.length})
          </button>
          <button
            onClick={() => setActiveTab("ytbp")}
            className={cn(
              "px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "ytbp" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
            )}
          >
            YTBP ({filteredYtbp.length})
          </button>
        </div>

        {/* Global Search Bar & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto pr-1">
          <div className="relative flex-grow xl:flex-grow-0 xl:w-[250px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search students..." 
              className="w-full pl-10 bg-white border-none shadow-sm h-10" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab === "all") setPage(1);
              }}
            />
          </div>
          
          {activeTab === "all" && (
            <>
              <select 
                className="h-10 rounded-md border-none bg-white shadow-sm px-3 py-2 text-sm"
                value={filters.department}
                onChange={(e) => { setFilters({...filters, department: e.target.value}); setPage(1); }}
              >
                <option value="">All Depts</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
              </select>
              <select 
                className="h-10 rounded-md border-none bg-white shadow-sm px-3 py-2 text-sm"
                value={filters.placement_status}
                onChange={(e) => { setFilters({...filters, placement_status: e.target.value}); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Unplaced">Unplaced</option>
              </select>
              <label className="flex items-center space-x-2 text-sm font-medium bg-white h-10 px-3 rounded-md shadow-sm">
                <input 
                  type="checkbox" 
                  checked={filters.show_deleted}
                  onChange={(e) => { setFilters({...filters, show_deleted: e.target.checked}); setPage(1); }}
                />
                <span>Show Deleted</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <CardTitle className="text-lg text-slate-900 flex items-center justify-between">
            <span>
              {activeTab === "all" && "All Students"}
              {activeTab === "selected" && "Selected Students Roster"}
              {activeTab === "shortlisted" && "Shortlisted Candidates Pipeline"}
              {activeTab === "ytbp" && "Yet To Be Placed (Available Pool)"}
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
                      <th className="px-4 py-4 font-medium">S/NO</th>
                      <th className="px-4 py-4 font-medium">Roll No</th>
                      <th className="px-4 py-4 font-medium">Name</th>
                      <th className="px-4 py-4 font-medium">Dept</th>
                      <th className="px-4 py-4 font-medium">CGPA</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="px-4 py-4 font-medium text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-medium">Student Details</th>
                      <th className="px-6 py-4 font-medium">Contact</th>
                      {activeTab === "selected" && (
                        <>
                          <th className="px-6 py-4 font-medium">Placed At</th>
                          <th className="px-6 py-4 font-medium">Package (CTC)</th>
                        </>
                      )}
                      {activeTab === "shortlisted" && (
                        <>
                          <th className="px-6 py-4 font-medium">Shortlisted For</th>
                          <th className="px-6 py-4 font-medium">Drive Date</th>
                        </>
                      )}
                      {activeTab === "ytbp" && (
                        <th className="px-6 py-4 font-medium">Top Skills</th>
                      )}
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* ALL STUDENTS TAB */}
                {activeTab === "all" && paginatedStudents.map((student: any, index: number) => (
                  <tr key={student.id} className={`hover:bg-slate-50/50 transition-colors ${student.is_deleted ? 'opacity-60 bg-red-50/20' : ''}`}>
                    <td className="px-4 py-3 text-slate-500">{skip + index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{student.roll_number}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {student.name}
                      {student.is_deleted && <span className="ml-2 text-xs text-red-500 font-semibold">(Deleted)</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{student.department}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{student.cgpa}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.placement_status === "Placed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {student.placement_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => { setSelectedStudent(student); setModalState("details"); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => { setSelectedStudent(student); setModalState("edit"); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {student.is_deleted ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => { setSelectedStudent(student); setModalState("restore"); }}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setSelectedStudent(student); setModalState("delete"); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {activeTab === "all" && paginatedStudents.length === 0 && !error && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No students found.</td></tr>
                )}

                {/* SELECTED TAB */}
                {activeTab === "selected" && filteredSelected.map((student: any) => (
                  <tr key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.department} • CGPA: {student.cgpa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col text-xs gap-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.mobile_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-emerald-500" />
                        <div>
                          <div className="font-medium text-slate-900">{student.company_name || "-"}</div>
                          <div className="text-xs text-slate-500">{student.role || "Role N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">{student.ctc_lpa ? `${student.ctc_lpa} LPA` : "-"}</span>
                    </td>
                  </tr>
                ))}

                {/* SHORTLISTED TAB */}
                {activeTab === "shortlisted" && filteredShortlisted.map((student: any) => (
                  <tr key={student.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.department} • CGPA: {student.cgpa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col text-xs gap-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.mobile_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{student.company_name || "-"}</div>
                      <div className="text-xs text-slate-500">{student.role || "Role N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium border border-slate-200">{student.date || "TBD"}</span>
                    </td>
                  </tr>
                ))}

                {/* YTBP TAB */}
                {activeTab === "ytbp" && filteredYtbp.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.department} • CGPA: {student.cgpa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col text-xs gap-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.mobile_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.skills && student.skills.length > 0 ? student.skills.map((skill: string) => (
                          <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-100">
                            {skill}
                          </span>
                        )) : <span className="text-xs text-slate-400">N/A</span>}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State for other tabs */}
                {((activeTab === "selected" && filteredSelected.length === 0) ||
                  (activeTab === "shortlisted" && filteredShortlisted.length === 0) ||
                  (activeTab === "ytbp" && filteredYtbp.length === 0)) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Users className="h-8 w-8 mb-2 opacity-50" />
                        <p>No students found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination for All Students */}
          {activeTab === "all" && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Showing {total === 0 ? 0 : skip + 1} to {Math.min(skip + limit, total)} of {total} entries
              </div>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || total === 0}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {modalState === "edit" && (
        <StudentForm 
          student={selectedStudent} 
          onClose={() => { setModalState("none"); mutate(); }} 
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
              <p className="text-slate-600 mb-6">
                Are you sure you want to {modalState === "delete" ? "delete" : "restore"} student <strong>{selectedStudent.name}</strong> ({selectedStudent.roll_number})?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setModalState("none")}>Cancel</Button>
                <Button 
                  variant="default" 
                  className={modalState === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
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
