"use client";

import { useState } from "react";
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
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const selectedStudents = [
  { id: 1, name: "Sneha Reddy", branch: "ECE", cgpa: 8.7, company: "Amazon", role: "Cloud Engineer", ctc: "12 LPA", email: "sneha.r@example.com", phone: "+91 9876543210" },
  { id: 2, name: "Ravi Teja", branch: "CSE", cgpa: 9.2, company: "Microsoft", role: "SDE 1", ctc: "18 LPA", email: "ravi.t@example.com", phone: "+91 9876543211" },
  { id: 3, name: "Anita Kumar", branch: "IT", cgpa: 8.8, company: "Google", role: "Software Engineer", ctc: "22 LPA", email: "anita.k@example.com", phone: "+91 9876543212" },
];

const shortlistedStudents = [
  { id: 4, name: "Arjun Kumar", branch: "CSE", cgpa: 8.9, company: "Google", role: "Software Engineer", date: "2026-09-15", email: "arjun.k@example.com", phone: "+91 9876543213" },
  { id: 5, name: "Priya Sharma", branch: "IT", cgpa: 9.1, company: "Microsoft", role: "SDE 1", date: "2026-09-20", email: "priya.s@example.com", phone: "+91 9876543214" },
  { id: 6, name: "Aisha Khan", branch: "CSE", cgpa: 9.4, company: "Amazon", role: "Cloud Engineer", date: "2026-08-25", email: "aisha.k@example.com", phone: "+91 9876543215" },
];

const ytbpStudents = [
  { id: 7, name: "Karan Patel", branch: "IT", cgpa: 7.9, skills: ["Python", "Django", "SQL"], email: "karan.p@example.com", phone: "+91 9876543216" },
  { id: 8, name: "Meera Joshi", branch: "CSE", cgpa: 9.0, skills: ["Machine Learning", "Python"], email: "meera.j@example.com", phone: "+91 9876543217" },
  { id: 9, name: "Rohan Gupta", branch: "ECE", cgpa: 8.8, skills: ["C++", "DSA", "Embedded Systems"], email: "rohan.g@example.com", phone: "+91 9876543218" },
  { id: 10, name: "Vikram Malhotra", branch: "CSE", cgpa: 9.5, skills: ["React", "Node.js"], email: "vikram.m@example.com", phone: "+91 9876543219" },
];

type TabType = "selected" | "shortlisted" | "ytbp";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("selected");
  const [searchQuery, setSearchQuery] = useState("");

  const filterByNameOrBranch = (student: any) => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.branch.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredSelected = selectedStudents.filter(filterByNameOrBranch);
  const filteredShortlisted = shortlistedStudents.filter(filterByNameOrBranch);
  const filteredYtbp = ytbpStudents.filter(filterByNameOrBranch);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Placement Reports</h2>
          <p className="text-slate-500 mt-1">Detailed breakdown of student placement statuses.</p>
        </div>
        
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2">
          <Download className="h-4 w-4" /> Export Full Report
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <Card className="bg-white border-slate-200 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab("selected")}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Selected Students</p>
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
              <p className="text-sm font-medium text-slate-500">Shortlisted Students</p>
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
              <p className="text-sm font-medium text-slate-500">YTBP (Yet To Be Placed)</p>
              <p className="text-3xl font-bold text-slate-900">{ytbpStudents.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-200/50 p-1 rounded-lg w-full">
        {/* Custom Tabs */}
        <div className="flex space-x-1 overflow-x-auto w-full md:w-auto">
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

        {/* Global Search Bar */}
        <div className="relative w-full md:w-[350px] mr-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            type="search" 
            placeholder="Search by name or branch..." 
            className="w-full pl-10 bg-white border-none shadow-sm h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <CardTitle className="text-lg text-slate-900 flex items-center justify-between">
            <span>
              {activeTab === "selected" && "Selected Students Roster"}
              {activeTab === "shortlisted" && "Shortlisted Candidates Pipeline"}
              {activeTab === "ytbp" && "Yet To Be Placed (Available Pool)"}
            </span>
            <Button variant="outline" size="sm" className="bg-white gap-2">
              <Download className="h-3 w-3" /> Export List
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* SELECTED TAB */}
                {activeTab === "selected" && filteredSelected.map(student => (
                  <tr key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.branch} • CGPA: {student.cgpa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col text-xs gap-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-emerald-500" />
                        <div>
                          <div className="font-medium text-slate-900">{student.company}</div>
                          <div className="text-xs text-slate-500">{student.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">{student.ctc}</span>
                    </td>
                  </tr>
                ))}

                {/* SHORTLISTED TAB */}
                {activeTab === "shortlisted" && filteredShortlisted.map(student => (
                  <tr key={student.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.branch} • CGPA: {student.cgpa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col text-xs gap-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{student.company}</div>
                      <div className="text-xs text-slate-500">{student.role}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium border border-slate-200">{student.date}</span>
                    </td>
                  </tr>
                ))}

                {/* YTBP TAB */}
                {activeTab === "ytbp" && filteredYtbp.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.branch} • CGPA: {student.cgpa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col text-xs gap-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.skills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
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
        </CardContent>
      </Card>
    </div>
  );
}
