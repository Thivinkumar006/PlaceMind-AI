"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  Star,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  RefreshCw,
  Mail,
  Phone,
  GraduationCap
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import * as XLSX from "xlsx";
import StudentExcelImportModal from "@/components/students/student-excel-import-modal";
import StudentForm from "@/components/students/student-form";
import StudentDetails from "@/components/students/student-details";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch data");
  }
  return res.json();
};

export default function StudentsPage() {
  const [modalState, setModalState] = useState<"none" | "import" | "add" | "edit" | "details" | "delete" | "restore">("none");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data, error, isLoading, mutate } = useSWR(`${API_BASE_URL}/students/?${queryParams.toString()}`, fetcher);
  const { data: allData, mutate: mutateAll } = useSWR(`${API_BASE_URL}/students/?limit=10000`, fetcher);

  const students = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total || 0;
  const stats = data?.stats || allData?.stats || {};
  const totalPages = Math.ceil(total / limit);

  const allStudents = Array.isArray(allData?.items) ? allData.items : [];

  const handleDownloadTemplate = () => {
    window.location.href = `${API_BASE_URL}/students/import/template`;
  };

  const handleExportAll = () => {
    if (allStudents.length === 0) {
      alert("No student data available to export.");
      return;
    }
    const exportData = allStudents.map((s: any, idx: number) => ({
      "S.No": idx + 1,
      "Roll No": s.roll_number,
      "Name": s.name,
      "Department": s.department,
      "Batch Year": s.batch_year,
      "Gender": s.gender,
      "Hosteller": s.is_hosteller ? "Yes" : "No",
      "SSLC %": s.sslc_percentage,
      "HSC %": s.hsc_percentage,
      "UG %": s.ug_percentage,
      "CGPA": s.cgpa,
      "Email": s.email,
      "Mobile": s.mobile_number,
      "Placement Status": s.placement_status,
      "Company Name": s.company_name || "",
      "CTC (LPA)": s.ctc_lpa || ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_roster.xlsx");
  };

  const handleAction = async (action: "delete" | "restore", id: number) => {
    try {
      await fetch(`${API_BASE_URL}/students/${id}${action === "restore" ? "/restore" : ""}`, {
        method: action === "delete" ? "DELETE" : "POST"
      });
      mutate();
      mutateAll();
      setModalState("none");
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} student record.`);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header & Quick Action Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            Student Panel & Management
          </h2>
          <p className="text-slate-500 mt-1">
            Upload Excel sheets, view student rosters, and manage records directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2"
            onClick={() => setModalState("import")}
          >
            <Upload className="h-4 w-4" /> Upload Excel Data
          </Button>

          <Button 
            variant="outline" 
            className="border-slate-300 text-slate-700 hover:bg-slate-100 gap-2"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4" /> Template
          </Button>

          <Button 
            variant="outline" 
            className="border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 gap-2"
            onClick={() => { setSelectedStudent(null); setModalState("add"); }}
          >
            <Plus className="h-4 w-4" /> Add Student
          </Button>

          <Button 
            variant="outline" 
            className="border-slate-300 text-slate-700 hover:bg-slate-100 gap-2"
            onClick={handleExportAll}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Enrolled</p>
              <p className="text-3xl font-bold text-slate-900">{allData?.total ?? total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Placed</p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.placed ?? allStudents.filter((s: any) => s.placement_status === "Placed").length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Shortlisted</p>
              <p className="text-3xl font-bold text-amber-600">
                {stats.shortlisted ?? allStudents.filter((s: any) => s.placement_status === "Shortlisted").length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Unplaced / YTBP</p>
              <p className="text-3xl font-bold text-slate-700">
                {stats.unplaced ?? allStudents.filter((s: any) => s.placement_status === "Unplaced" || s.placement_status === "YET_TO_BE_PLACED" || !s.placement_status).length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, roll no, email..."
                className="pl-9 bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.department}
                onChange={(e) => {
                  setFilters({ ...filters, department: e.target.value });
                  setPage(1);
                }}
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="AIDS">AI & DS</option>
              </select>

              <select
                className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.placement_status}
                onChange={(e) => {
                  setFilters({ ...filters, placement_status: e.target.value });
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Unplaced">Unplaced</option>
              </select>

              <label className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 h-10 px-3 rounded-md cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded text-blue-600"
                  checked={filters.show_deleted}
                  onChange={(e) => {
                    setFilters({ ...filters, show_deleted: e.target.checked });
                    setPage(1);
                  }}
                />
                <span>Show Deleted</span>
              </label>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-500 hover:text-slate-800"
                onClick={() => { mutate(); mutateAll(); }}
                title="Refresh Table"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Student List Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Student Directory</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Showing {students.length} of {total} registered student records
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3.5 font-medium">S/NO</th>
                  <th className="px-4 py-3.5 font-medium">Roll No</th>
                  <th className="px-4 py-3.5 font-medium">Student Name</th>
                  <th className="px-4 py-3.5 font-medium">Dept & Batch</th>
                  <th className="px-4 py-3.5 font-medium">CGPA</th>
                  <th className="px-4 py-3.5 font-medium">Contact</th>
                  <th className="px-4 py-3.5 font-medium">Placement Status</th>
                  <th className="px-4 py-3.5 font-medium">Company & CTC</th>
                  <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                        <p className="text-sm">Loading student directory...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-red-500">
                      <p className="font-semibold">Unable to fetch students data.</p>
                      <p className="text-xs mt-1 text-slate-500">Please make sure the backend server is running.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => mutate()}>
                        Retry
                      </Button>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <Users className="h-10 w-10 text-slate-300" />
                        <p className="font-semibold text-slate-700">No student records found</p>
                        <p className="text-xs text-slate-500">
                          {searchQuery || filters.department || filters.placement_status
                            ? "Try adjusting your search criteria or filters."
                            : "Get started by uploading an Excel file or adding a student manually."}
                        </p>
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                          onClick={() => setModalState("import")}
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload Excel Now
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student: any, index: number) => {
                    const isPlaced = student.placement_status === "Placed";
                    const isShortlisted = student.placement_status === "Shortlisted";
                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${student.is_deleted ? 'opacity-60 bg-red-50/20' : ''}`}
                      >
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{skip + index + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 font-mono text-xs">
                          {student.roll_number}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {student.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 text-sm">
                                {student.name}
                                {student.is_deleted && (
                                  <span className="ml-2 text-xs font-normal text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                    Deleted
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">{student.gender} • {student.is_hosteller ? "Hosteller" : "Day Scholar"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="font-semibold text-slate-800">{student.department}</span>
                          <span className="text-slate-400 text-xs ml-1">({student.batch_year})</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">
                            {student.cgpa || "0.0"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-slate-700">
                              <Mail className="h-3 w-3 text-slate-400" /> {student.email}
                            </span>
                            {student.mobile_number && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Phone className="h-3 w-3 text-slate-400" /> {student.mobile_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPlaced 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                              : isShortlisted 
                              ? "bg-amber-100 text-amber-800 border border-amber-200" 
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {student.placement_status || "Unplaced"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {student.company_name ? (
                            <div>
                              <div className="font-semibold text-slate-900">{student.company_name}</div>
                              {student.ctc_lpa && (
                                <div className="text-emerald-600 font-bold">{student.ctc_lpa} LPA</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" 
                              onClick={() => { setSelectedStudent(student); setModalState("details"); }}
                              title="View Full Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
                              onClick={() => { setSelectedStudent(student); setModalState("edit"); }}
                              title="Edit Student"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {student.is_deleted ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50" 
                                onClick={() => { setSelectedStudent(student); setModalState("restore"); }}
                                title="Restore Student"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" 
                                onClick={() => { setSelectedStudent(student); setModalState("delete"); }}
                                title="Delete Student"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
              <div className="text-xs text-slate-500">
                Showing <span className="font-medium">{skip + 1}</span> to{" "}
                <span className="font-medium">{Math.min(skip + limit, total)}</span> of{" "}
                <span className="font-medium">{total}</span> total students
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || total === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODALS */}
      {modalState === "import" && (
        <StudentExcelImportModal
          onClose={() => setModalState("none")}
          onSuccess={() => {
            mutate();
            mutateAll();
            setModalState("none");
          }}
        />
      )}

      {(modalState === "add" || modalState === "edit") && (
        <StudentForm
          student={modalState === "edit" ? selectedStudent : null}
          onClose={() => {
            setModalState("none");
            mutate();
            mutateAll();
          }}
        />
      )}

      {modalState === "details" && selectedStudent && (
        <StudentDetails
          student={selectedStudent}
          onClose={() => setModalState("none")}
        />
      )}

      {(modalState === "delete" || modalState === "restore") && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">
                Confirm {modalState === "delete" ? "Deletion" : "Restoration"}
              </h3>
              <p className="text-slate-600 mb-6 text-sm">
                Are you sure you want to {modalState === "delete" ? "delete" : "restore"} student{" "}
                <strong>{selectedStudent.name}</strong> ({selectedStudent.roll_number})?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setModalState("none")}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className={
                    modalState === "delete"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
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
