"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Download, Upload, Edit2, Trash2, RotateCcw, Eye, X } from "lucide-react";
import * as XLSX from "xlsx";
import StudentForm from "@/components/students/student-form";
import StudentDetails from "@/components/students/student-details";

const fetcher = (url: str) => fetch(url).then((res) => res.json());

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const skip = (page - 1) * limit;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    placement_status: "",
    show_deleted: false,
  });

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(filters.department && { department: filters.department }),
    ...(filters.placement_status && { placement_status: filters.placement_status }),
    ...(filters.show_deleted && { show_deleted: "true" })
  });

  const { data, error, mutate } = useSWR(`http://localhost:8000/api/v1/students/?${queryParams.toString()}`, fetcher);
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [modalState, setModalState] = useState<"none" | "add" | "edit" | "details" | "delete" | "restore">("none");

  const students = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleExport = () => {
    // Fetch all records for export (simplification)
    fetch(`http://localhost:8000/api/v1/students/?limit=10000`)
      .then(res => res.json())
      .then(data => {
        const ws = XLSX.utils.json_to_sheet(data.items);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "students_export.xlsx");
      });
  };

  const handleAction = async (action: "delete" | "restore", id: number) => {
    try {
      await fetch(`http://localhost:8000/api/v1/students/${id}${action === "restore" ? "/restore" : ""}`, {
        method: action === "delete" ? "DELETE" : "POST"
      });
      mutate();
      setModalState("none");
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/students/upload`, {
        method: "POST",
        body: formData,
      });
      const responseData = await res.json();
      if (res.ok) {
        alert(responseData.message);
        mutate();
      } else {
        alert(`Error: ${responseData.detail || "Failed to upload file"}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Student Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-white" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <Button variant="outline" className="bg-white" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" /> {isUploading ? "Uploading..." : "Import"}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setModalState("add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium text-slate-900">All Students</CardTitle>
            <div className="flex flex-wrap items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="w-[250px] pl-9 bg-white"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <select 
                className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
              </select>
              <select 
                className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
                value={filters.placement_status}
                onChange={(e) => setFilters({...filters, placement_status: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Unplaced">Unplaced</option>
              </select>
              <label className="flex items-center space-x-2 text-sm font-medium">
                <input 
                  type="checkbox" 
                  checked={filters.show_deleted}
                  onChange={(e) => setFilters({...filters, show_deleted: e.target.checked})}
                />
                <span>Show Deleted</span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-4 font-medium">Roll No</th>
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Dept</th>
                  <th className="px-4 py-4 font-medium">Batch</th>
                  <th className="px-4 py-4 font-medium">CGPA</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: any) => (
                  <tr key={student.id} className={`border-b last:border-0 hover:bg-slate-50/50 transition-colors ${student.is_deleted ? 'opacity-60 bg-red-50/20' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-900">{student.roll_number}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {student.name}
                      {student.is_deleted && <span className="ml-2 text-xs text-red-500 font-semibold">(Deleted)</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{student.department}</td>
                    <td className="px-4 py-3 text-slate-600">{student.batch_year}</td>
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
                {students.length === 0 && !error && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              Showing {skip + 1} to {Math.min(skip + limit, total)} of {total} entries
            </div>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {(modalState === "add" || modalState === "edit") && (
        <StudentForm 
          student={modalState === "edit" ? selectedStudent : null} 
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
