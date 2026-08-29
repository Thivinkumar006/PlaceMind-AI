"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Star,
  ChevronRight,
  MoreVertical,
  Mail,
  MessageSquare,
  Activity,
  X,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const drives = [
  { id: 1, title: "Google Software Engineer Fall Hiring", company: "Google", role: "Software Engineer", date: "2026-09-15" },
  { id: 2, title: "Microsoft SDE 1 Recruitment", company: "Microsoft", role: "SDE 1", date: "2026-09-20" },
  { id: 3, title: "Amazon AWS Cloud Engineer Hiring", company: "Amazon", role: "Cloud Engineer", date: "2026-08-25" }
];

const atsCandidates = [
  { id: 1, name: "Arjun Kumar", branch: "CSE", cgpa: 8.9, status: "Applied", appliedAt: "2 days ago", matchScore: 92 },
  { id: 2, name: "Priya Sharma", branch: "IT", cgpa: 9.1, status: "Shortlisted", appliedAt: "1 week ago", matchScore: 95 },
  { id: 3, name: "Rahul Singh", branch: "CSE", cgpa: 8.5, status: "Interviewing", appliedAt: "2 weeks ago", matchScore: 88 },
  { id: 4, name: "Sneha Reddy", branch: "ECE", cgpa: 8.7, status: "Offered", appliedAt: "3 weeks ago", matchScore: 90 },
  { id: 5, name: "Karan Patel", branch: "IT", cgpa: 7.9, status: "Rejected", appliedAt: "1 month ago", matchScore: 75 },
  { id: 6, name: "Aisha Khan", branch: "CSE", cgpa: 9.4, status: "Shortlisted", appliedAt: "3 days ago", matchScore: 98 },
];

const matchingCandidates = [
  { id: 101, name: "Vikram Malhotra", branch: "CSE", cgpa: 9.5, skills: ["React", "Node.js", "Python"], matchScore: 99, status: "Not Applied" },
  { id: 102, name: "Ananya Desai", branch: "IT", cgpa: 9.2, skills: ["Java", "Spring Boot", "AWS"], matchScore: 94, status: "Invited" },
  { id: 103, name: "Rohan Gupta", branch: "ECE", cgpa: 8.8, skills: ["C++", "DSA", "SQL"], matchScore: 89, status: "Not Applied" },
  { id: 104, name: "Meera Joshi", branch: "CSE", cgpa: 9.0, skills: ["Python", "Machine Learning"], matchScore: 85, status: "Not Applied" },
];

const atsColumns = [
  { id: "Applied", label: "Applied", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "Shortlisted", label: "Shortlisted", icon: Star, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "Interviewing", label: "Interviewing", icon: Clock, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { id: "Offered", label: "Offered", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "Rejected", label: "Rejected", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
];

export default function AtsMatchingPage() {
  const [activeTab, setActiveTab] = useState<"ats" | "matching">("ats");
  const [selectedDrive, setSelectedDrive] = useState(drives[0].id);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAtsCandidates = atsCandidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMatchingCandidates = matchingCandidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header section with Drive selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">ATS & Matching</h2>
          <p className="text-slate-500 mt-1">Manage applications and discover top talent for placement drives.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm min-w-[300px]">
          <div className="flex items-center justify-center bg-blue-100 p-2 rounded-md">
            <Briefcase className="h-5 w-5 text-blue-700" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-xs font-medium text-slate-500">Active Drive</span>
            <select 
              className="text-sm font-semibold bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-slate-900 w-full"
              value={selectedDrive}
              onChange={(e) => setSelectedDrive(Number(e.target.value))}
            >
              {drives.map(drive => (
                <option key={drive.id} value={drive.id}>{drive.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-200/50 p-1 rounded-lg w-full">
        {/* Custom Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("ats")}
            className={cn(
              "px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "ats" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
            )}
          >
            Applicant Tracking (ATS)
          </button>
          <button
            onClick={() => setActiveTab("matching")}
            className={cn(
              "px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "matching" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
            )}
          >
            Smart Matching Engine
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-[350px] mr-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            type="search" 
            placeholder="Filter by name, branch, or skill..." 
            className="w-full pl-10 bg-white border-none shadow-sm h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ATS View */}
      {activeTab === "ats" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Applied</p>
                  <p className="text-2xl font-bold text-slate-900">{atsCandidates.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">In Progress</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {atsCandidates.filter(c => c.status === "Shortlisted" || c.status === "Interviewing").length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Offered / Accepted</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {atsCandidates.filter(c => c.status === "Offered").length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Rejected</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {atsCandidates.filter(c => c.status === "Rejected").length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x">
          {atsColumns.map(column => {
            const columnCandidates = filteredAtsCandidates.filter(c => c.status === column.id);
            const Icon = column.icon;
            
            return (
              <div key={column.id} className="min-w-[320px] max-w-[320px] flex flex-col gap-3 snap-start">
                {/* Column Header */}
                <div className={cn("flex items-center justify-between p-3 rounded-lg border", column.bg, column.border)}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", column.color)} />
                    <h3 className={cn("font-semibold", column.color)}>{column.label}</h3>
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-white shadow-sm", column.color)}>
                    {columnCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="flex flex-col gap-3">
                  {columnCandidates.map(candidate => (
                    <div 
                      key={candidate.id} 
                      onClick={() => setSelectedCandidate(candidate)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
                          <p className="text-xs text-slate-500">{candidate.branch} • {candidate.cgpa} CGPA</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                          <Clock className="h-3 w-3" /> {candidate.appliedAt}
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-100">
                          <Activity className="h-3 w-3" /> {candidate.matchScore}% Match
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {columnCandidates.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                      <span className="text-sm font-medium">No candidates</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Matching Engine View */}
      {activeTab === "matching" && (
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-5">
            <div>
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" /> 
                Recommended Candidates
              </CardTitle>
              <CardDescription>AI-driven matches based on current drive eligibility criteria.</CardDescription>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Button variant="outline" size="icon" className="bg-white flex-shrink-0">
                <Filter className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Candidate Details</th>
                    <th className="px-6 py-4 font-medium">Match Score</th>
                    <th className="px-6 py-4 font-medium">Skills Map</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatchingCandidates.map(candidate => (
                    <tr key={candidate.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{candidate.name}</div>
                            <div className="text-xs text-slate-500">{candidate.branch} • CGPA: {candidate.cgpa}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className={cn(
                                "h-2 rounded-full",
                                candidate.matchScore > 90 ? "bg-emerald-500" : candidate.matchScore > 80 ? "bg-amber-500" : "bg-red-500"
                              )} 
                              style={{ width: `${candidate.matchScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{candidate.matchScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-medium border border-slate-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1.5 rounded-full text-[11px] font-semibold border",
                          candidate.status === "Invited" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1 border-slate-300 text-slate-700 bg-white">
                            <MessageSquare className="h-3 w-3" /> Chat
                          </Button>
                          <Button size="sm" className="h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <Mail className="h-3 w-3" /> Invite
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Candidate Details</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 rounded-full hover:bg-slate-200" onClick={() => setSelectedCandidate(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold flex-shrink-0">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                  <p className="text-slate-500 font-medium">{selectedCandidate.branch} • {selectedCandidate.cgpa} CGPA</p>
                  
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                      Applied: {selectedCandidate.appliedAt || "N/A"}
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">
                      Current Status: {selectedCandidate.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1">Match Score</div>
                  <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {selectedCandidate.matchScore}%
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium mb-1">Resume</div>
                  <Button variant="outline" size="sm" className="w-full mt-1 bg-white border-slate-200 text-blue-600 hover:text-blue-700">
                    <FileText className="h-4 w-4 mr-2" /> View PDF
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-1">Top Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills ? selectedCandidate.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  )) : (
                    <>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Data Structures</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Algorithms</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">React</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Python</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Advance Stage
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
