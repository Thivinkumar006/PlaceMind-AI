"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Globe, Mail, Phone, ExternalLink, MapPin, FileText, Loader2 } from "lucide-react";
import useSWR from "swr";
import { API_BASE_URL } from "@/lib/api";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
        alert("Failed to save company");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const companies = data?.items || [];

  const filteredCompanies = companies.filter((c: any) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
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
    switch(status) {
      case "COLD": return "bg-blue-100 text-blue-700";
      case "HOT": return "bg-red-100 text-red-700";
      case "WARM": return "bg-amber-100 text-amber-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Companies</h2>
        <div className="flex space-x-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Company
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium text-slate-900">All Companies</CardTitle>
            <div className="flex flex-wrap items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search companies..."
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
                  <tr key={company.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {company.name}
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{company.industry}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.location)}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:underline transition-colors"
                      >
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{company.location}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{company.contact_person}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex flex-col gap-1 text-xs">
                        {company.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{company.contact_email}</span>
                          </div>
                        )}
                        {company.contact_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{company.contact_phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {company.jd_link ? (
                        <a href={company.jd_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-medium">View JD</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No JD</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => openEditModal(company)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No companies found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                    <option value="COLD">COLD</option>
                    <option value="HOT">HOT</option>
                    <option value="WARM">WARM</option>
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
