"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Globe, Mail, Phone, ExternalLink, MapPin, FileText } from "lucide-react";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Mock data for companies
  const companies = [
    { id: 1, name: "Google", industry: "Technology", location: "Mountain View, CA", jd_link: "https://careers.google.com", website: "https://google.com", contact_person: "Sundar Pichai", contact_email: "contact@google.com", contact_phone: "+1 234 567 8900", is_active: true, status: "COLD" },
    { id: 2, name: "Microsoft", industry: "Technology", location: "Redmond, WA", jd_link: "https://careers.microsoft.com", website: "https://microsoft.com", contact_person: "Satya Nadella", contact_email: "contact@microsoft.com", contact_phone: "+1 987 654 3210", is_active: true, status: "HOT" },
    { id: 3, name: "Amazon", industry: "E-commerce", location: "Seattle, WA", jd_link: "https://amazon.jobs", website: "https://amazon.com", contact_person: "Andy Jassy", contact_email: "contact@amazon.com", contact_phone: "+1 555 123 4567", is_active: true, status: "WARM" },
    { id: 4, name: "Goldman Sachs", industry: "Finance", location: "New York, NY", jd_link: "", website: "https://goldmansachs.com", contact_person: "David Solomon", contact_email: "contact@gs.com", contact_phone: "+1 111 222 3333", is_active: false, status: "COLD" },
  ];

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
                {filteredCompanies.map((company) => (
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
                {filteredCompanies.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No companies found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
