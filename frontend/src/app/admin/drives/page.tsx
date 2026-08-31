"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Building2, 
  Users, 
  Loader2, 
  AlertTriangle,
  FileText,
  Clock,
  X
} from "lucide-react";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error("Network response was not ok");
  return r.json();
});

const DEFAULT_DRIVES = [
  { id: 1, company_name: "Microsoft", title: "SDE 1 Recruitment", drive_date: "2026-09-20T09:00:00Z", eligibility_criteria: "CGPA > 7.5, All Branches", status: "WARM", description: "Campus hiring for SDE 1 engineering roles." },
  { id: 2, company_name: "Google", title: "Software Engineer Fall Hiring", drive_date: "2026-09-15T10:00:00Z", eligibility_criteria: "CGPA > 8.0, CSE/IT", status: "WARM", description: "Full-time SDE recruitment drive for graduating batch." },
  { id: 3, company_name: "Amazon", title: "AWS Cloud Engineer Hiring", drive_date: "2026-08-25T11:00:00Z", eligibility_criteria: "CGPA > 7.0, CSE/IT", status: "HOT", description: "Recruitment drive for Cloud Support and Solutions Architects." },
  { id: 4, company_name: "Goldman Sachs", title: "Summer Analyst Program", drive_date: "2026-07-10T09:30:00Z", eligibility_criteria: "CGPA > 8.5", status: "COMPLETED", description: "Internship & analyst recruitment for Quantitative Finance." },
];

export default function DrivesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Local state fallback in case backend is offline
  const [localDrives, setLocalDrives] = useState<any[]>(DEFAULT_DRIVES);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selected / Editing item
  const [editingDriveId, setEditingDriveId] = useState<number | null>(null);
  const [driveToDelete, setDriveToDelete] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    company_name: "",
    title: "",
    drive_date: "",
    eligibility_criteria: "",
    status: "WARM",
    description: ""
  });

  // Fetch drives from backend
  const { data: drivesData, error: drivesError, isLoading: drivesLoading, mutate: mutateDrives } = useSWR(
    `${API_BASE_URL}/drives`,
    fetcher,
    {
      revalidateOnFocus: false,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 3000);
      }
    }
  );

  // Fetch companies for dropdown/suggestions
  const { data: companiesData } = useSWR(`${API_BASE_URL}/companies`, fetcher, { revalidateOnFocus: false });
  const companiesList: any[] = companiesData?.items || [];

  // Determine active drives list
  const drives: any[] = drivesData?.items || localDrives;

  // Helper to format ISO date for datetime-local input
  const formatForDateTimeLocal = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      company_name: "",
      title: "",
      drive_date: "",
      eligibility_criteria: "",
      status: "WARM",
      description: ""
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (drive: any) => {
    setEditingDriveId(drive.id);
    setFormData({
      company_name: drive.company_name || "",
      title: drive.title || "",
      drive_date: formatForDateTimeLocal(drive.drive_date),
      eligibility_criteria: drive.eligibility_criteria || "",
      status: drive.status || "WARM",
      description: drive.description || ""
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (drive: any) => {
    setDriveToDelete(drive);
    setIsDeleteModalOpen(true);
  };

  // Handle Create Drive
  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      drive_date: formData.drive_date ? new Date(formData.drive_date).toISOString() : null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/drives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        mutateDrives();
      } else {
        // Fallback to local state if backend route fails
        const newId = drives.length > 0 ? Math.max(...drives.map(d => Number(d.id) || 0)) + 1 : 1;
        setLocalDrives([{ id: newId, ...formData, drive_date: payload.drive_date || new Date().toISOString() }, ...drives]);
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      console.warn("Backend error, updating local state:", err);
      const newId = drives.length > 0 ? Math.max(...drives.map(d => Number(d.id) || 0)) + 1 : 1;
      setLocalDrives([{ id: newId, ...formData, drive_date: payload.drive_date || new Date().toISOString() }, ...drives]);
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit / Update Drive
  const handleUpdateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriveId) return;

    setIsSubmitting(true);
    const payload = {
      ...formData,
      drive_date: formData.drive_date ? new Date(formData.drive_date).toISOString() : null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/drives/${editingDriveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        mutateDrives();
      } else {
        // Fallback update local state
        setLocalDrives(prev => prev.map(d => d.id === editingDriveId ? { ...d, ...payload } : d));
      }
      setIsEditModalOpen(false);
      setEditingDriveId(null);
    } catch (err) {
      console.warn("Backend error during update, applying local update:", err);
      setLocalDrives(prev => prev.map(d => d.id === editingDriveId ? { ...d, ...payload } : d));
      setIsEditModalOpen(false);
      setEditingDriveId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Drive
  const handleDeleteDrive = async () => {
    if (!driveToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/drives/${driveToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        mutateDrives();
      } else {
        setLocalDrives(prev => prev.filter(d => d.id !== driveToDelete.id));
      }
      setIsDeleteModalOpen(false);
      setDriveToDelete(null);
    } catch (err) {
      console.warn("Backend error during delete, applying local deletion:", err);
      setLocalDrives(prev => prev.filter(d => d.id !== driveToDelete.id));
      setIsDeleteModalOpen(false);
      setDriveToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDrives = drives.filter(d => {
    const titleMatch = (d.title || "").toLowerCase().includes(search.toLowerCase());
    const companyMatch = (d.company_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || companyMatch;
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case "WARM": 
      case "SCHEDULED": 
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "HOT": 
      case "ONGOING": 
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "COMPLETED": 
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COLD": 
        return "bg-slate-100 text-slate-700 border-slate-200";
      default: 
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Placement Drives</h2>
          <p className="text-sm text-slate-500 mt-1">Manage ongoing and upcoming company campus placement drives</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            onClick={openCreateModal}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Drive
          </Button>
        </div>
      </div>

      {/* Main Drives Card */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-medium text-slate-900">All Drives</CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {filteredDrives.length}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search drives or companies..."
                  className="w-[260px] pl-9 bg-white text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="WARM">Scheduled (WARM)</option>
                <option value="HOT">Ongoing (HOT)</option>
                <option value="COMPLETED">Completed</option>
                <option value="COLD">Cold</option>
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
              <tbody className="divide-y divide-slate-100">
                {filteredDrives.map((drive) => (
                  <tr key={drive.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{drive.title}</div>
                      {drive.description && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">{drive.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-800">{drive.company_name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>
                          {drive.drive_date ? new Date(drive.drive_date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "TBA"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-xs max-w-[180px] truncate" title={drive.eligibility_criteria}>
                          {drive.eligibility_criteria || "Open to all"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(drive.status)}`}>
                        {drive.status === "WARM" || drive.status === "SCHEDULED" ? "Scheduled" : 
                         drive.status === "HOT" || drive.status === "ONGOING" ? "Ongoing" : 
                         drive.status === "COMPLETED" ? "Completed" : 
                         drive.status === "COLD" ? "Cold" : drive.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Edit Placement Drive"
                          className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          onClick={() => openEditModal(drive)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Delete Placement Drive"
                          className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => openDeleteModal(drive)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDrives.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-base font-medium text-slate-700">No placement drives found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE DRIVE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Placement Drive</h3>
                  <p className="text-xs text-slate-500">Schedule a new recruitment drive</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDrive} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name *</label>
                <div className="relative">
                  <Input 
                    required 
                    list="company-list"
                    value={formData.company_name} 
                    onChange={e => setFormData({...formData, company_name: e.target.value})} 
                    placeholder="e.g. Google, Microsoft, Amazon" 
                  />
                  <datalist id="company-list">
                    {companiesList.map((c: any) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Drive Title *</label>
                <Input 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Software Engineer Fall Hiring" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date & Time</label>
                  <Input 
                    type="datetime-local" 
                    value={formData.drive_date} 
                    onChange={e => setFormData({...formData, drive_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="WARM">Scheduled (WARM)</option>
                    <option value="HOT">Ongoing (HOT)</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="COLD">Cold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <Input 
                  value={formData.eligibility_criteria} 
                  onChange={e => setFormData({...formData, eligibility_criteria: e.target.value})} 
                  placeholder="e.g. CGPA > 8.0, CSE/IT" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea 
                  rows={2}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Additional details regarding rounds, venue, or requirements..."
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Drive"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DRIVE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Placement Drive</h3>
                  <p className="text-xs text-slate-500">Update drive details and criteria</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDrive} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name *</label>
                <Input 
                  required 
                  list="company-list-edit"
                  value={formData.company_name} 
                  onChange={e => setFormData({...formData, company_name: e.target.value})} 
                  placeholder="e.g. Google" 
                />
                <datalist id="company-list-edit">
                  {companiesList.map((c: any) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Drive Title *</label>
                <Input 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Software Engineer Fall Hiring" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date & Time</label>
                  <Input 
                    type="datetime-local" 
                    value={formData.drive_date} 
                    onChange={e => setFormData({...formData, drive_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="WARM">Scheduled (WARM)</option>
                    <option value="HOT">Ongoing (HOT)</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="COLD">Cold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <Input 
                  value={formData.eligibility_criteria} 
                  onChange={e => setFormData({...formData, eligibility_criteria: e.target.value})} 
                  placeholder="e.g. CGPA > 8.0, CSE/IT" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea 
                  rows={2}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Additional details regarding rounds, venue, or requirements..."
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && driveToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Placement Drive</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Are you sure you want to delete <span className="font-semibold text-slate-800">"{driveToDelete.title}"</span> for <span className="font-semibold text-slate-800">{driveToDelete.company_name}</span>?
                </p>
                <p className="text-xs text-red-500 mt-1">This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsDeleteModalOpen(false); setDriveToDelete(null); }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDeleteDrive}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Drive"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
