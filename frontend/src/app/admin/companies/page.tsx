"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Globe, Mail, Phone, ExternalLink, MapPin, FileText, Loader2, Upload, FileSpreadsheet } from "lucide-react";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";
import CompanyExcelImportModal from "@/components/companies/company-excel-import-modal";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    status: "COLD",
    jd_link: "",
    website: "",
  });

  const { data, error, isLoading, mutate } = useSWR(`${API_BASE_URL}/companies`, fetcher);

  const openEditModal = (company: any) => {
    setEditingCompanyId(company.id);
    setFormData({
      name: company.name || "",
      industry: company.industry || "",
      location: company.location || "",
      contact_person: company.contact_person || "",
      contact_email: company.contact_email || "",
      contact_phone: company.contact_phone || "",
      status: company.status || "COLD",
      jd_link: company.jd_link || "",
      website: company.website || "",
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCompanyId(null);
    setFormData({
      name: "",
      industry: "",
      location: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      status: "COLD",
      jd_link: "",
      website: "",
    });
    setIsAddModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingCompanyId 
        ? `${API_BASE_URL}/companies/${editingCompanyId}` 
        : `${API_BASE_URL}/companies`;
      const method = editingCompanyId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        mutate();
        setIsAddModalOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || "Failed to save company");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving company.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate();
      } else {
        alert("Failed to delete company");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting company");
    }
  };
  
  const companies = data?.items || [];

  const filteredCompanies = companies.filter((c: any) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                          c.industry?.toLowerCase().includes(search.toLowerCase()) ||
                          c.location?.toLowerCase().includes(search.toLowerCase()) ||
                          c.contact_person?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        Failed to load companies data. Please make sure the backend is running.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case "COLD": return "bg-blue-100 text-blue-700 border border-blue-200";
      case "WARM": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "HOT": return "bg-red-100 text-red-700 border border-red-200";
      case "COMPLETED": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Companies</h2>
          <p className="text-sm text-slate-500 mt-1">Manage recruiting partners, placement drives, and contact information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Upload className="h-4 w-4" /> Upload Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium flex items-center gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-slate-900">All Companies</CardTitle>
              <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                {filteredCompanies.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search companies, location, contact..."
                  className="w-[280px] pl-9 bg-white"
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
                <option value="COLD">COLD (Created)</option>
                <option value="WARM">WARM (Contacted / Scheduled)</option>
                <option value="HOT">HOT (JD Uploaded / Ongoing)</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-4 font-medium">Company Name</th>
                  <th className="px-4 py-4 font-medium">Industry</th>
                  <th className="px-4 py-4 font-medium">Location</th>
                  <th className="px-4 py-4 font-medium">Contact Person</th>
                  <th className="px-4 py-4 font-medium">Contact Details</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">JD</th>
                  <th className="px-4 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company: any) => (
                  <tr key={company.id} className="border-b last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{company.name}</span>
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{company.industry || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {company.location ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.location)}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:underline transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{company.location}</span>
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{company.contact_person || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex flex-col gap-1 text-xs">
                        {company.contact_email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <a href={`mailto:${company.contact_email}`} className="hover:text-blue-600 hover:underline">{company.contact_email}</a>
                          </div>
                        )}
                        {company.contact_phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <a href={`tel:${company.contact_phone}`} className="hover:text-blue-600">{company.contact_phone}</a>
                          </div>
                        )}
                        {!company.contact_email && !company.contact_phone && <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(company.status)}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {company.jd_link ? (
                        <a href={company.jd_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs">
                          <FileText className="h-4 w-4" />
                          <span>View JD</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No JD</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEditModal(company)} title="Edit Company">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => handleDeleteCompany(company.id, company.name)} title="Delete Company">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <FileSpreadsheet className="h-10 w-10 text-slate-300" />
                        <div>
                          <p className="font-semibold text-slate-700">No companies found</p>
                          <p className="text-xs text-slate-400 mt-0.5">Upload company records from an Excel spreadsheet or add a new company manually.</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => setIsImportModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Excel
                          </Button>
                          <Button size="sm" variant="outline" onClick={openAddModal}>
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Company
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Excel Import Modal */}
      {isImportModalOpen && (
        <CompanyExcelImportModal 
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            mutate();
          }}
        />
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-semibold text-slate-900">{editingCompanyId ? "Edit Company" : "Add New Company"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                &times;
              </Button>
            </div>
            <form onSubmit={handleSaveCompany} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Company Name *</label>
                  <Input required placeholder="e.g. Google" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Industry</label>
                  <Input placeholder="e.g. Technology" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <Input placeholder="e.g. Mountain View, CA" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="COLD">COLD (Created)</option>
                    <option value="WARM">WARM (Contacted / Scheduled)</option>
                    <option value="HOT">HOT (JD Uploaded / Ongoing)</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contact Person</label>
                  <Input placeholder="e.g. Sundar Pichai" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contact Email</label>
                  <Input type="email" placeholder="contact@example.com" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contact Phone</label>
                  <Input placeholder="+1 234 567 8900" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Website</label>
                  <Input type="url" placeholder="https://example.com" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">JD Link</label>
                  <Input type="url" placeholder="https://careers.example.com" value={formData.jd_link} onChange={e => setFormData({...formData, jd_link: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Company"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
