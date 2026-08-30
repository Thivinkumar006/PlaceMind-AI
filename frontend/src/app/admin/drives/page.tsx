"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Calendar, Building2, Users } from "lucide-react";

export default function DrivesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // State data for placement drives
  const [drives, setDrives] = useState([
    { id: 1, company_name: "Google", title: "Software Engineer Fall Hiring", drive_date: "2026-09-15T10:00:00Z", eligibility_criteria: "CGPA > 8.0, CSE/IT", status: "COLD" },
    { id: 2, company_name: "Microsoft", title: "SDE 1 Recruitment", drive_date: "2026-09-20T09:00:00Z", eligibility_criteria: "CGPA > 7.5, All Branches", status: "COLD" },
    { id: 3, company_name: "Amazon", title: "AWS Cloud Engineer Hiring", drive_date: "2026-08-25T11:00:00Z", eligibility_criteria: "CGPA > 7.0, CSE/IT", status: "HOT" },
    { id: 4, company_name: "Goldman Sachs", title: "Summer Analyst Program", drive_date: "2026-07-10T09:30:00Z", eligibility_criteria: "CGPA > 8.5", status: "WARM" },
  ]);

  const [newDrive, setNewDrive] = useState({
    company_name: "",
    title: "",
    drive_date: "",
    eligibility_criteria: "",
    status: "COLD"
  });

  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = drives.length > 0 ? Math.max(...drives.map(d => d.id)) + 1 : 1;
    setDrives([{ id: newId, ...newDrive }, ...drives]);
    setIsCreateModalOpen(false);
    setNewDrive({ company_name: "", title: "", drive_date: "", eligibility_criteria: "", status: "COLD" });
  };

  const filteredDrives = drives.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case "COLD": return "bg-blue-100 text-blue-700";
      case "HOT": return "bg-amber-100 text-amber-700";
      case "WARM": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Placement Drives</h2>
        <div className="flex space-x-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Drive
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium text-slate-900">All Drives</CardTitle>
            <div className="flex flex-wrap items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search drives or companies..."
                  className="w-[250px] pl-9 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="COLD">COLD</option>
                <option value="HOT">HOT</option>
                <option value="WARM">WARM</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-4 font-medium">Drive Details</th>
                  <th className="px-4 py-4 font-medium">Company</th>
                  <th className="px-4 py-4 font-medium">Date & Time</th>
                  <th className="px-4 py-4 font-medium">Eligibility</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrives.map((drive) => (
                  <tr key={drive.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{drive.title}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{drive.company_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(drive.drive_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-xs max-w-[150px] truncate" title={drive.eligibility_criteria}>{drive.eligibility_criteria}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(drive.status)}`}>
                        {drive.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDrives.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No placement drives found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Drive Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New Placement Drive</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateDrive} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <Input 
                  required 
                  value={newDrive.company_name} 
                  onChange={e => setNewDrive({...newDrive, company_name: e.target.value})} 
                  placeholder="e.g. Google" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drive Title</label>
                <Input 
                  required 
                  value={newDrive.title} 
                  onChange={e => setNewDrive({...newDrive, title: e.target.value})} 
                  placeholder="e.g. Software Engineer Fall Hiring" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                <Input 
                  type="datetime-local" 
                  required 
                  value={newDrive.drive_date} 
                  onChange={e => setNewDrive({...newDrive, drive_date: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Eligibility Criteria</label>
                <Input 
                  required 
                  value={newDrive.eligibility_criteria} 
                  onChange={e => setNewDrive({...newDrive, eligibility_criteria: e.target.value})} 
                  placeholder="e.g. CGPA > 8.0, CSE/IT" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  value={newDrive.status}
                  onChange={e => setNewDrive({...newDrive, status: e.target.value})}
                >
                  <option value="COLD">COLD</option>
                  <option value="HOT">HOT</option>
                  <option value="WARM">WARM</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
